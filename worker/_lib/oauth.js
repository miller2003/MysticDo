/**
 * MysticDo — OAuth 2.0 authorization server (RFC 6749 / 8414 / 9728 / 7591 / 8252).
 *
 * WHY THIS EXISTS
 * ---------------
 * MysticDo publishes no protected data. Every content resource is public and
 * readable anonymously, so strictly speaking a site like this needs no
 * authorization server at all. This one exists because a meaningful share of
 * agent runtimes will only call a remote MCP endpoint after completing a
 * standard discovery + token handshake. Rather than fabricate metadata for an
 * authorization server that does not exist, the server is implemented for real:
 * every endpoint advertised in /.well-known/oauth-authorization-server answers.
 *
 * SECURITY POSTURE
 * ----------------
 *   · Tokens are opaque and HMAC-signed, so they are verifiable without server
 *     state — important on a Worker, which has no durable storage binding here.
 *   · Registration is stateless: the `client_id` is a signed envelope carrying
 *     the client's registered redirect URIs. Nothing to store, nothing to leak,
 *     nothing to garbage-collect.
 *   · Redirect URIs are restricted to this origin plus loopback (RFC 8252 §7.3).
 *     The authorization endpoint therefore cannot be turned into an open
 *     redirector. This is the single most important control in this file.
 *   · PKCE (S256) is mandatory for authorization_code. Both `plain` and an
 *     absent challenge are rejected.
 *
 * On the signing key: `env.OAUTH_HMAC_KEY` is used when configured. When it is
 * not, a documented default is used. That default is public, and a forged token
 * therefore gains nothing — tokens unlock exactly the content an anonymous
 * request already reaches. Set the secret anyway before this surface is used
 * for anything that is not public.
 */

import { ORIGIN, OAUTH_SCOPES, ACCESS_MODEL_NOTE } from './agent-discovery.js';

const CODE_TTL_SECONDS = 60;
const TOKEN_TTL_SECONDS = 3600;
const CLIENT_ID_TTL_SECONDS = 365 * 24 * 3600;

const FALLBACK_KEY =
  'mysticdo-public-read-only-token-v1-do-not-reuse-set-OAUTH_HMAC_KEY';

/* ═════════════════════════════ primitives ═════════════════════════════ */

const encoder = new TextEncoder();

function b64urlEncode(bytes) {
  let binary = '';
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i += 1) binary += String.fromCharCode(view[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlEncodeText(text) {
  return b64urlEncode(encoder.encode(text));
}

function b64urlDecodeToText(value) {
  const padded = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

let keyPromise = null;
function signingKey(env) {
  if (!keyPromise) {
    const secret = (env && env.OAUTH_HMAC_KEY) || FALLBACK_KEY;
    keyPromise = crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
  }
  return keyPromise;
}

async function sign(env, payload) {
  const body = b64urlEncodeText(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', await signingKey(env), encoder.encode(body));
  return body + '.' + b64urlEncode(sig);
}

/**
 * Everything this server issues is `<prefix>_<body>.<sig>`. Callers pass the
 * whole string back, so the prefix must be stripped before the signature over
 * `<body>` can be checked.
 */
const TOKEN_PREFIX = /^(?:mc|mcode|mt)_/;

/** Returns the payload, or null when the signature, shape or expiry fails. */
async function verify(env, token) {
  if (typeof token !== 'string') return null;

  const compact = token.replace(TOKEN_PREFIX, '');
  const dot = compact.indexOf('.');
  if (dot <= 0) return null;

  const body = compact.slice(0, dot);
  const sig = compact.slice(dot + 1);
  if (!body || !sig) return null;

  let expected;
  try {
    expected = b64urlEncode(await crypto.subtle.sign('HMAC', await signingKey(env), encoder.encode(body)));
  } catch {
    return null;
  }
  if (expected !== sig) return null;

  let payload;
  try {
    payload = JSON.parse(b64urlDecodeToText(body));
  } catch {
    return null;
  }
  if (!payload || typeof payload !== 'object') return null;
  if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function sha256B64url(text) {
  return crypto.subtle.digest('SHA-256', encoder.encode(text)).then(b64urlEncode);
}

function now() {
  return Math.floor(Date.now() / 1000);
}

/* ═════════════════════════════ responses ═════════════════════════════ */

function jsonResponse(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      ...extra,
    },
  });
}

function oauthError(error, description, status = 400, extra = {}) {
  return jsonResponse({ error, error_description: description }, status, extra);
}

function htmlError(title, detail, status = 400) {
  const body =
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex">' +
    '<title>' + title + ' — MysticDo</title>' +
    '<style>body{background:#FCFAF5;color:#211B10;font:16px/1.6 system-ui,sans-serif;' +
    'max-width:36rem;margin:12vh auto;padding:0 1.25rem}h1{font-size:1.5rem}' +
    'code{background:#F3EFE5;padding:.15em .35em;border-radius:4px;font-size:.9em}' +
    'a{color:#8A651A}</style></head><body><h1>' + title + '</h1><p>' + detail + '</p>' +
    '<p><a href="/auth.md">auth.md</a> · <a href="/methodology.html">Methodology</a></p>' +
    '</body></html>';
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex',
    },
  });
}

/* ═════════════════════════════ redirect policy ═════════════════════════════ */

/**
 * A redirect target is accepted only when it points at this origin, or at a
 * loopback address. Anything else is refused, which is what stops
 * /oauth/authorize from being an open redirector.
 */
export function isAllowedRedirectUri(value) {
  if (typeof value !== 'string' || !value) return false;
  if (value.includes('#')) return false;
  if (value.length > 2000) return false;

  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');

  // Same origin: only over https.
  if (url.protocol === 'https:' && (host === 'mysticdo.com' || host === 'www.mysticdo.com')) return true;

  // Loopback (RFC 8252 §7.3): http or https, any port. `localhost` is included
  // because it is what most native-agent harnesses default to.
  if ((url.protocol === 'http:' || url.protocol === 'https:') &&
      (host === 'localhost' || host === '127.0.0.1' || host === '::1')) {
    return true;
  }

  return false;
}

function effectiveRedirectUri(registered, requested) {
  if (registered.length === 1 && !requested) return registered[0];
  if (requested && registered.includes(requested)) return requested;
  return null;
}

/* ═════════════════════════════ 1. registration (RFC 7591) ═════════════════════════════ */

export async function handleRegister(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return oauthError('invalid_client_metadata', 'Body must be a JSON object.');
  }
  if (!body || typeof body !== 'object') {
    return oauthError('invalid_client_metadata', 'Body must be a JSON object.');
  }

  const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];
  if (!redirectUris.length) {
    return oauthError('invalid_redirect_uri', 'At least one redirect_uri is required.');
  }
  const rejected = redirectUris.filter((uri) => !isAllowedRedirectUri(uri));
  if (rejected.length) {
    return oauthError(
      'invalid_redirect_uri',
      'These redirect URIs are not permitted: ' + rejected.join(', ') +
      '. Only ' + ORIGIN + '/... and loopback addresses (http://127.0.0.1, http://[::1], ' +
      'http://localhost) are accepted.',
    );
  }

  const requestedGrants = Array.isArray(body.grant_types) && body.grant_types.length
    ? body.grant_types
    : ['authorization_code', 'client_credentials'];
  const grantTypes = requestedGrants.filter((g) => g === 'authorization_code' || g === 'client_credentials');
  if (!grantTypes.length) {
    return oauthError('invalid_client_metadata', 'Supported grant_types: authorization_code, client_credentials.');
  }

  const authMethod = body.token_endpoint_auth_method || 'none';
  if (authMethod !== 'none') {
    return oauthError(
      'invalid_client_metadata',
      'Only token_endpoint_auth_method="none" is supported. MysticDo issues no client secrets.',
    );
  }

  const scope = typeof body.scope === 'string' ? body.scope : OAUTH_SCOPES.join(' ');
  const scopeList = scope.split(/\s+/).filter(Boolean);
  if (scopeList.some((s) => !OAUTH_SCOPES.includes(s))) {
    return oauthError('invalid_client_metadata', 'Unsupported scope. Supported: ' + OAUTH_SCOPES.join(', ') + '.');
  }

  const issuedAt = now();
  const clientId = 'mc_' + (await sign(env, {
    k: 'client',
    ru: redirectUris,
    gt: grantTypes,
    sc: scopeList,
    name: String(body.client_name || 'unnamed-agent').slice(0, 120),
    iat: issuedAt,
    exp: issuedAt + CLIENT_ID_TTL_SECONDS,
  }));

  return jsonResponse(
    {
      client_id: clientId,
      client_id_issued_at: issuedAt,
      client_name: String(body.client_name || 'unnamed-agent').slice(0, 120),
      redirect_uris: redirectUris,
      grant_types: grantTypes,
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      scope: scopeList.join(' '),
    },
    201,
  );
}

/* ═════════════════════════════ 2. authorization (RFC 6749 §4.1) ═════════════════════════════ */

export async function handleAuthorize(request, env) {
  const url = new URL(request.url);
  const q = url.searchParams;

  const clientId = q.get('client_id') || '';
  const payload = await verify(env, clientId);
  if (!payload || payload.k !== 'client') {
    return htmlError(
      'Unknown client',
      'The <code>client_id</code> is missing, malformed or expired. Register a client at ' +
      '<code>POST /oauth/register</code> first — see <a href="/auth.md">auth.md</a>.',
      400,
    );
  }

  const registered = Array.isArray(payload.ru) ? payload.ru : [];
  const redirectUri = effectiveRedirectUri(registered, q.get('redirect_uri') || '');
  if (!redirectUri) {
    return htmlError(
      'Redirect URI mismatch',
      'The requested <code>redirect_uri</code> is not among the URIs registered for this ' +
      '<code>client_id</code>. Registering a new client is free and instant.',
      400,
    );
  }

  const state = q.get('state');
  const respond = (params) => {
    const target = new URL(redirectUri);
    for (const [k, v] of Object.entries(params)) target.searchParams.set(k, v);
    if (state !== null) target.searchParams.set('state', state);
    return new Response(null, {
      status: 302,
      headers: { Location: target.toString(), 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
    });
  };

  if ((q.get('response_type') || '') !== 'code') {
    return respond({ error: 'unsupported_response_type', error_description: 'Only response_type=code is supported.' });
  }

  const challenge = q.get('code_challenge') || '';
  const method = q.get('code_challenge_method') || '';
  if (!challenge || method !== 'S256') {
    return respond({
      error: 'invalid_request',
      error_description: 'PKCE is mandatory: supply code_challenge and code_challenge_method=S256.',
    });
  }

  const requestedScope = q.get('scope');
  const scopeList = requestedScope
    ? requestedScope.split(/\s+/).filter(Boolean)
    : (Array.isArray(payload.sc) && payload.sc.length ? payload.sc : OAUTH_SCOPES);
  if (scopeList.some((s) => !OAUTH_SCOPES.includes(s))) {
    return respond({ error: 'invalid_scope', error_description: 'Supported scope: ' + OAUTH_SCOPES.join(' ') + '.' });
  }

  const issuedAt = now();
  const code = 'mcode_' + (await sign(env, {
    k: 'code',
    cid: clientId,
    ru: redirectUri,
    cc: challenge,
    sc: scopeList,
    iat: issuedAt,
    exp: issuedAt + CODE_TTL_SECONDS,
  }));

  // No consent screen. There is nothing to consent to: the resource is public
  // and the token grants no capability an anonymous request lacks.
  return respond({ code });
}

/* ═════════════════════════════ 3. token (RFC 6749 §4.4, §5) ═════════════════════════════ */

export async function handleToken(request, env) {
  let params;
  const contentType = request.headers.get('Content-Type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      params = new URLSearchParams();
      for (const [k, v] of Object.entries(body || {})) if (v != null) params.set(k, String(v));
    } else {
      params = new URLSearchParams(await request.text());
    }
  } catch {
    return oauthError('invalid_request', 'Could not parse the request body.');
  }

  const grantType = params.get('grant_type') || '';
  const requestedScope = params.get('scope');
  const scopeList = requestedScope ? requestedScope.split(/\s+/).filter(Boolean) : OAUTH_SCOPES.slice();
  if (scopeList.some((s) => !OAUTH_SCOPES.includes(s))) {
    return oauthError('invalid_scope', 'Supported scope: ' + OAUTH_SCOPES.join(' ') + '.');
  }

  const issue = async () => {
    const issuedAt = now();
    const accessToken = 'mt_' + (await sign(env, {
      k: 'access',
      sub: 'public',
      ru: ORIGIN,
      sc: scopeList,
      iat: issuedAt,
      exp: issuedAt + TOKEN_TTL_SECONDS,
    }));
    return jsonResponse({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: TOKEN_TTL_SECONDS,
      scope: scopeList.join(' '),
    }, 200, { 'Cache-Control': 'no-store', Pragma: 'no-cache' });
  };

  if (grantType === 'client_credentials') {
    const clientId = params.get('client_id');
    if (clientId) {
      const payload = await verify(env, clientId);
      if (!payload || payload.k !== 'client') {
        return oauthError('invalid_client', 'Unknown or expired client_id.', 401, {
          'WWW-Authenticate': 'Bearer error="invalid_client"',
        });
      }
    }
    return issue();
  }

  if (grantType === 'authorization_code') {
    const code = params.get('code') || '';
    const codePayload = await verify(env, code);
    if (!codePayload || codePayload.k !== 'code') {
      return oauthError('invalid_grant', 'The authorization code is invalid or has expired (60 second lifetime).');
    }

    const clientId = params.get('client_id') || '';
    if (clientId && clientId !== codePayload.cid) {
      return oauthError('invalid_grant', 'The authorization code was issued to a different client_id.');
    }

    const redirectUri = params.get('redirect_uri') || '';
    if (redirectUri && redirectUri !== codePayload.ru) {
      return oauthError('invalid_grant', 'redirect_uri does not match the value used at the authorization endpoint.');
    }

    const verifier = params.get('code_verifier') || '';
    if (!verifier) {
      return oauthError('invalid_request', 'code_verifier is required (PKCE).');
    }
    if (await sha256B64url(verifier) !== codePayload.cc) {
      return oauthError('invalid_grant', 'PKCE verification failed: code_verifier does not match code_challenge.');
    }

    if (Array.isArray(codePayload.sc)) {
      for (const s of codePayload.sc) {
        if (!scopeList.includes(s)) scopeList.push(s);
      }
    }
    return issue();
  }

  if (!grantType) return oauthError('invalid_request', 'grant_type is required.');
  return oauthError(
    'unsupported_grant_type',
    'Supported grant types: client_credentials, authorization_code.',
  );
}

/* ═════════════════════════════ 4. revocation (RFC 7009) ═════════════════════════════ */

export async function handleRevoke(request) {
  // Tokens are stateless and the resource is public, so there is no deny list to
  // write. RFC 7009 §2.2 requires a 200 for unknown tokens, which is exactly
  // what this returns — and it is truthful here rather than evasive.
  return jsonResponse({}, 200, { 'Cache-Control': 'no-store' });
}

/* ═════════════════════════════ shared metadata ═════════════════════════════ */

export const OAUTH_META_NOTE = ACCESS_MODEL_NOTE;
