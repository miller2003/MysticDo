/**
 * MysticDo — agent discovery documents.
 *
 * Single source of truth for every machine-readable document the site
 * publishes for AI agents. Everything is derived from the constants below so
 * the documents cannot drift apart from each other.
 *
 * Coverage (one export per published surface):
 *   · openapi.json                  — RFC 9727 `service-desc` (real API description)
 *   · api-catalog                   — RFC 9727 / RFC 9264 linkset
 *   · ai-catalog.json               — ARD manifest (agentic resource discovery)
 *   · mcp/server-card.json          — MCP Server Card
 *   · oauth-authorization-server    — RFC 8414
 *   · oauth-protected-resource      — RFC 9728
 *   · jwks.json                     — RFC 7517
 *   · auth.md                       — agent registration guide
 *
 * HONESTY CONSTRAINT
 * ------------------
 * Every URL referenced here is implemented in this Worker and actually
 * answers. `VERIFIED_ENDPOINTS` in scripts/verify-agent-surface.mjs asserts
 * that. Do not advertise a capability the deployment does not have.
 */

export const ORIGIN = 'https://mysticdo.com';
export const SITE_NAME = 'MysticDo';
export const SITE_TAGLINE = 'Match Your Spiritual Needs. Choose What to Do Next.';
export const SITE_DESCRIPTION =
  'An intent-driven spiritual decision platform. MysticDo helps people work out ' +
  'whether they need a psychic, tarot, astrology, or medium reading, which type ' +
  'fits their situation, and what to check before they pay — for psychic ' +
  'readings, tarot, astrology, numerology, manifestation, and more.';

export const MCP_PATH = '/mcp';
export const MCP_ENDPOINT = ORIGIN + MCP_PATH;
export const MCP_PROTOCOL_VERSION = '2025-06-18';

export const CONTENT_INDEX_PATH = '/assets/data/content-index.json';
export const AGENT_SKILLS_PATH = '/.well-known/agent-skills';
export const OAUTH_SCOPES = ['mysticdo:read'];
export const OAUTH_GRANT_TYPES = ['client_credentials', 'authorization_code'];

/** Extra members are permitted by RFC 8414 §3.1 / RFC 9728 §2 (extension members). */
export const ACCESS_MODEL_NOTE =
  'MysticDo has no user accounts and no protected data. Every content resource is ' +
  'public and readable without credentials. The OAuth surface exists so that agents ' +
  'which insist on a bearer-token handshake can complete one; tokens grant read ' +
  'access to exactly the same public content that anonymous requests already reach.';

/* ═════════════════════════ 1. OpenAPI (service-desc) ═════════════════════════ */

export function openapiDocument() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'MysticDo agent API',
      version: '1.0.0',
      summary: SITE_DESCRIPTION,
      description:
        'Read-only HTTP interface to MysticDo\'s decision content. The site is static ' +
        'HTML; this document describes the machine-facing behaviour layered on top of it ' +
        'by an edge Worker: markdown content negotiation, a prebuilt content index, and a ' +
        'Streamable HTTP MCP endpoint. No endpoint requires authentication.',
      contact: { name: 'MysticDo', url: ORIGIN + '/methodology.html' },
      license: { name: 'Content use: attribution requested', url: ORIGIN + '/methodology.html' },
    },
    servers: [{ url: ORIGIN }],
    tags: [
      { name: 'content', description: 'Retrieve MysticDo pages as HTML or Markdown.' },
      { name: 'discovery', description: 'Catalogues and machine-readable indexes.' },
      { name: 'agent', description: 'MCP endpoint for tool-calling agents.' },
      { name: 'auth', description: 'Optional bearer-token handshake. Read-only, public data.' },
    ],
    paths: {
      '/{path}': {
        get: {
          tags: ['content'],
          operationId: 'getContent',
          summary: 'Fetch any MysticDo page as HTML, or as Markdown via content negotiation.',
          description:
            'Send `Accept: text/markdown` to receive the page converted to Markdown at the ' +
            'edge. The conversion is lossless for prose, headings, lists, tables and links. ' +
            'If Markdown is not requested, `text/html` is returned.',
          parameters: [
            {
              name: 'path',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: 'guides/psychic-vs-tarot.html',
            },
            {
              name: 'Accept',
              in: 'header',
              required: false,
              schema: { type: 'string', enum: ['text/html', 'text/markdown'] },
            },
          ],
          responses: {
            200: {
              description: 'Page body.',
              content: {
                'text/html': { schema: { type: 'string' } },
                'text/markdown': { schema: { type: 'string' } },
              },
            },
            404: { description: 'No such page.' },
          },
        },
      },
      [CONTENT_INDEX_PATH]: {
        get: {
          tags: ['discovery'],
          operationId: 'getContentIndex',
          summary: 'Whole-site content index: titles, descriptions, headings and excerpted text.',
          responses: {
            200: { description: 'Index of every indexable page.', content: { 'application/json': {} } },
          },
        },
      },
      '/.well-known/api-catalog': {
        get: {
          tags: ['discovery'],
          operationId: 'getApiCatalog',
          summary: 'RFC 9727 API catalog (linkset) for this origin.',
          responses: {
            200: { description: 'API catalog.', content: { 'application/linkset+json': {} } },
          },
        },
      },
      '/.well-known/ai-catalog.json': {
        get: {
          tags: ['discovery'],
          operationId: 'getArdManifest',
          summary: 'Agentic Resource Discovery manifest.',
          responses: { 200: { description: 'ARD manifest.', content: { 'application/json': {} } } },
        },
      },
      '/.well-known/agent-skills/index.json': {
        get: {
          tags: ['discovery'],
          operationId: 'getAgentSkillsIndex',
          summary: 'Agent Skills Discovery index (v0.2.0) with sha256 digests.',
          responses: { 200: { description: 'Skills index.', content: { 'application/json': {} } } },
        },
      },
      '/.well-known/mcp/server-card.json': {
        get: {
          tags: ['agent', 'discovery'],
          operationId: 'getMcpServerCard',
          summary: 'MCP Server Card describing the /mcp endpoint.',
          responses: { 200: { description: 'Server card.', content: { 'application/json': {} } } },
        },
      },
      [MCP_PATH]: {
        post: {
          tags: ['agent'],
          operationId: 'mcpJsonRpc',
          summary: 'MCP Streamable HTTP endpoint (JSON-RPC 2.0).',
          description:
            'Stateless MCP server. Accepts `initialize`, `tools/list`, `tools/call` and ' +
            '`ping`. Responses are returned as `application/json`; no SSE stream is opened.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['jsonrpc', 'method'],
                  properties: {
                    jsonrpc: { type: 'string', enum: ['2.0'] },
                    id: {},
                    method: { type: 'string' },
                    params: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'JSON-RPC response.', content: { 'application/json': {} } } },
        },
        get: {
          tags: ['agent'],
          operationId: 'mcpMethodNotAllowed',
          summary: 'The endpoint is stateless and does not open an SSE stream; use POST.',
          responses: { 405: { description: 'Use POST.' } },
        },
      },
      '/api/health': {
        get: {
          tags: ['discovery'],
          operationId: 'getHealth',
          summary: 'Liveness probe.',
          responses: { 200: { description: 'Service status.', content: { 'application/json': {} } } },
        },
      },
      '/oauth/token': {
        post: {
          tags: ['auth'],
          operationId: 'oauthToken',
          summary: 'Issue a read-only bearer token (client_credentials or authorization_code + PKCE).',
          requestBody: {
            required: true,
            content: {
              'application/x-www-form-urlencoded': {
                schema: {
                  type: 'object',
                  properties: {
                    grant_type: { type: 'string', enum: OAUTH_GRANT_TYPES },
                    scope: { type: 'string' },
                    client_id: { type: 'string' },
                    code: { type: 'string' },
                    code_verifier: { type: 'string' },
                    redirect_uri: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Token response (RFC 6749 §5.1).', content: { 'application/json': {} } },
            400: { description: 'OAuth error (RFC 6749 §5.2).', content: { 'application/json': {} } },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        oauth2: {
          type: 'oauth2',
          description: ACCESS_MODEL_NOTE,
          flows: {
            clientCredentials: {
              tokenUrl: ORIGIN + '/oauth/token',
              scopes: { 'mysticdo:read': 'Read public MysticDo content.' },
            },
            authorizationCode: {
              authorizationUrl: ORIGIN + '/oauth/authorize',
              tokenUrl: ORIGIN + '/oauth/token',
              scopes: { 'mysticdo:read': 'Read public MysticDo content.' },
            },
          },
        },
        bearerAuth: { type: 'http', scheme: 'bearer' },
      },
    },
    'x-access-model': ACCESS_MODEL_NOTE,
  };
}

/* ═══════════════════════ 2. API catalog (RFC 9727 / 9264) ═══════════════════════ */

export function apiCatalog() {
  return {
    linkset: [
      {
        anchor: ORIGIN + '/',
        'service-desc': [
          {
            href: ORIGIN + '/.well-known/openapi.json',
            type: 'application/vnd.oai.openapi+json;version=3.1',
            title: 'OpenAPI 3.1 description of the MysticDo agent API',
          },
        ],
        'service-doc': [
          {
            href: ORIGIN + '/llms.txt',
            type: 'text/markdown',
            title: 'LLM-oriented site map',
          },
          {
            href: ORIGIN + '/methodology.html',
            type: 'text/html',
            title: 'Editorial methodology',
          },
        ],
        'service-meta': [
          {
            href: ORIGIN + '/.well-known/ai-catalog.json',
            type: 'application/json',
            title: 'ARD capability manifest',
          },
        ],
        status: [
          {
            href: ORIGIN + '/api/health',
            type: 'application/json',
            title: 'Liveness probe',
          },
        ],
      },
      {
        anchor: MCP_ENDPOINT,
        'service-desc': [
          {
            href: ORIGIN + '/.well-known/mcp/server-card.json',
            type: 'application/json',
            title: 'MCP Server Card',
          },
        ],
        'service-doc': [
          {
            href: AGENT_SKILLS_PATH + '/index.json',
            type: 'application/json',
            title: 'Agent Skills discovery index',
          },
        ],
        status: [
          {
            href: ORIGIN + '/api/health',
            type: 'application/json',
            title: 'Liveness probe',
          },
        ],
      },
      {
        anchor: CONTENT_INDEX_PATH === ORIGIN ? ORIGIN : ORIGIN + CONTENT_INDEX_PATH,
        'service-desc': [
          {
            href: ORIGIN + CONTENT_INDEX_PATH,
            type: 'application/json',
            title: 'Content index (titles, headings, excerpts)',
          },
        ],
        'service-doc': [
          {
            href: ORIGIN + '/sitemap.xml',
            type: 'application/xml',
            title: 'Canonical URL list',
          },
        ],
      },
    ],
  };
}

/* ═════════════════════════════ 3. ARD manifest ═════════════════════════════ */

export function aiCatalog() {
  return {
    specVersion: '1.0',
    host: {
      displayName: SITE_NAME,
      identifier: 'did:web:mysticdo.com',
      documentationUrl: ORIGIN + '/.well-known/api-catalog',
    },
    entries: [
      {
        identifier: 'urn:air:mysticdo.com:server:mcp',
        displayName: 'MysticDo MCP server',
        description:
          'Stateless Streamable HTTP MCP server exposing MysticDo\'s decision content: ' +
          'site search, page retrieval as Markdown, topic listing and a reading-type recommender.',
        type: 'application/mcp-server-card+json',
        url: ORIGIN + '/.well-known/mcp/server-card.json',
        representativeQueries: [
          'find a guide on how much a psychic reading costs',
          'which kind of reading fits a question about whether my ex will contact me',
          'what should I check before paying an online tarot reader',
          'explain the difference between a psychic reading and a tarot reading',
        ],
      },
      {
        identifier: 'urn:air:mysticdo.com:index:content',
        displayName: 'MysticDo content index',
        description:
          'Prebuilt JSON index of every indexable MysticDo page: URL, kind, title, ' +
          'meta description, headings, FAQ questions and excerpted body text.',
        type: 'application/json',
        url: ORIGIN + CONTENT_INDEX_PATH,
        representativeQueries: [
          'list every MysticDo decision guide',
          'which pages cover the cost of a birth chart reading',
          'give me the direct answer from the page about telling if an online psychic is legit',
        ],
      },
      {
        identifier: 'urn:air:mysticdo.com:index:agent-skills',
        displayName: 'MysticDo agent skills',
        description:
          'Agent Skills discovery index. Each entry is a SKILL.md describing a decision ' +
          'procedure an agent can apply directly: matching a spiritual need to a practice, ' +
          'vetting a reader before payment, and estimating reading costs.',
        type: 'application/json',
        url: AGENT_SKILLS_PATH + '/index.json',
        representativeQueries: [
          'what skills does mysticdo.com publish for agents',
          'give me a checklist for vetting a psychic reader before paying',
          'how do I estimate what a reading should cost',
        ],
      },
      {
        identifier: 'urn:air:mysticdo.com:doc:llms',
        displayName: 'MysticDo site map for language models',
        description:
          'llms.txt-format overview: positioning, every practice and question hub, all ' +
          'decision guides, comparisons, free tools and trust pages, each with a canonical URL.',
        type: 'text/markdown',
        url: ORIGIN + '/llms.txt',
        representativeQueries: [
          'what is mysticdo.com about',
          'list the practices covered by mysticdo.com',
          'where are the tarot comparison guides on mysticdo.com',
        ],
      },
      {
        identifier: 'urn:air:mysticdo.com:catalog:api',
        displayName: 'MysticDo API catalog',
        description:
          'RFC 9727 linkset pointing at the OpenAPI description, documentation, capability ' +
          'manifest and status endpoint for this origin.',
        type: 'application/linkset+json',
        url: ORIGIN + '/.well-known/api-catalog',
        representativeQueries: [
          'how do I call the mysticdo.com content API',
          'what API endpoints does mysticdo.com expose',
        ],
      },
    ],
  };
}

/* ════════════════════════ 4. MCP Server Card (SEP-1649) ════════════════════════ */

export function mcpServerCard() {
  return {
    $schema: 'https://modelcontextprotocol.io/schemas/server-card.json',
    serverInfo: {
      name: 'mysticdo',
      version: '1.0.0',
      title: 'MysticDo',
      description:
        SITE_DESCRIPTION +
        ' Public, read-only, no authentication required.',
      websiteUrl: ORIGIN + '/',
    },
    // `endpoint` is published both at the top level and inside `transport`
    // so that consumers reading either shape (SEP-1649 is a draft) resolve it.
    endpoint: MCP_ENDPOINT,
    transport: {
      type: 'streamable-http',
      endpoint: MCP_ENDPOINT,
      url: MCP_ENDPOINT,
      protocolVersion: MCP_PROTOCOL_VERSION,
      stateless: true,
      supportsSse: false,
    },
    capabilities: {
      tools: { listChanged: false },
      resources: {},
      prompts: {},
      logging: {},
    },
    authentication: {
      required: false,
      type: 'none',
      protectedResourceMetadata: ORIGIN + '/.well-known/oauth-protected-resource',
      note: ACCESS_MODEL_NOTE,
    },
    instructions:
      'Call tools/list to enumerate tools. search_mysticdo is the fastest way to find ' +
      'relevant MysticDo pages; get_mysticdo_page returns the full page as Markdown; ' +
      'recommend_reading_type maps a described situation to the practice that fits it.',
    documentationUrl: AGENT_SKILLS_PATH + '/index.json',
  };
}

/* ═══════════════════ 5. OAuth 2.0 / OIDC discovery metadata ═══════════════════ */

export function oauthAuthorizationServerMetadata() {
  return {
    issuer: ORIGIN,
    authorization_endpoint: ORIGIN + '/oauth/authorize',
    token_endpoint: ORIGIN + '/oauth/token',
    // Tokens are opaque (HMAC-verifiable, not JWT), so no signing keys are
    // published. RFC 8414 §2 makes jwks_uri OPTIONAL; it is advertised here
    // because some clients probe for it, and the document truthfully reports
    // an empty key set.
    jwks_uri: ORIGIN + '/.well-known/jwks.json',
    registration_endpoint: ORIGIN + '/oauth/register',
    scopes_supported: OAUTH_SCOPES,
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: OAUTH_GRANT_TYPES,
    token_endpoint_auth_methods_supported: ['none'],
    code_challenge_methods_supported: ['S256'],
    revocation_endpoint: ORIGIN + '/oauth/revoke',
    revocation_endpoint_auth_methods_supported: ['none'],
    service_documentation: ORIGIN + '/auth.md',
    ui_locales_supported: ['en'],
    op_policy_uri: ORIGIN + '/methodology.html',
    op_tos_uri: ORIGIN + '/about.html',
    resource_indicators_supported: true,
    'x-token-format': 'opaque',
    'x-access-model': ACCESS_MODEL_NOTE,
    'x-client-registration-policy':
      'Dynamic client registration is limited to redirect URIs on ' + ORIGIN +
      ' or loopback addresses (RFC 8252 §7.3). Third-party redirect targets are rejected.',
  };
}

export function oauthProtectedResourceMetadata() {
  return {
    resource: MCP_ENDPOINT,
    authorization_servers: [ORIGIN],
    scopes_supported: OAUTH_SCOPES,
    bearer_methods_supported: ['header'],
    resource_documentation: AGENT_SKILLS_PATH + '/index.json',
    resource_name: 'MysticDo MCP server',
    'x-access-model': ACCESS_MODEL_NOTE,
  };
}

export function jwks() {
  return { keys: [] };
}

/* ═══════════════════════════════ 6. auth.md ═══════════════════════════════ */

export const AUTH_MD = `# auth.md — MysticDo

How AI agents authenticate with, and register against, \`mysticdo.com\`.

## Summary

**MysticDo requires no authentication.** Every published resource — the full
content library, the content index, and the \`/mcp\` endpoint — is public and
readable anonymously. There are no user accounts, no private data, and no
tiered entitlements.

If your agent runtime insists on completing an OAuth handshake before it will
call a remote tool, an optional bearer-token flow is available. A token grants
read access to exactly the same public content that an anonymous request
already reaches. Declining to use it costs you nothing.

## Who this is for

Agents that fetch decision content about psychic, tarot, astrology and medium
readings on behalf of a user, or that call the \`/mcp\` tools to search and
retrieve that content. The audience is machine-to-machine, or a browser agent
acting under explicit user instruction.

## Discovery documents

| Document | URL |
|---|---|
| OAuth Authorization Server Metadata (RFC 8414) | \`/.well-known/oauth-authorization-server\` |
| OAuth Protected Resource Metadata (RFC 9728) | \`/.well-known/oauth-protected-resource\` |
| MCP Server Card (SEP-1649) | \`/.well-known/mcp/server-card.json\` |
| API catalog (RFC 9727) | \`/.well-known/api-catalog\` |
| OpenAPI 3.1 description | \`/.well-known/openapi.json\` |
| Agent Skills index | \`/.well-known/agent-skills/index.json\` |
| Content index | \`/assets/data/content-index.json\` |

Protected resource: \`https://mysticdo.com/mcp\`
Authorization server: \`https://mysticdo.com\` (issuer)

## Registration

Registration is self-service and stateless. There is no approval queue and no
credential is issued by email.

\`\`\`http
POST /oauth/register
Content-Type: application/json

{
  "client_name": "example-agent",
  "redirect_uris": ["http://127.0.0.1:8765/callback"],
  "grant_types": ["authorization_code", "client_credentials"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none",
  "scope": "mysticdo:read"
}
\`\`\`

The response contains a signed \`client_id\`. Registration is stateless: the
\`client_id\` itself encodes the client's registered redirect URIs, so there is
nothing stored server-side and nothing to revoke.

Registration is deliberately restricted. A \`redirect_uris\` entry is accepted
only when it targets:

- \`https://mysticdo.com/...\` — this origin, or
- a loopback address (\`http://127.0.0.1\`, \`http://[::1]\`, \`http://localhost\`)
  on any port, per RFC 8252 §7.3.

Third-party redirect targets are rejected with \`invalid_redirect_uri\`. This is
what keeps the authorization endpoint from being an open redirector.

### Registration methods

| Method | \`identity_types_supported\` | How it works |
|---|---|---|
| Anonymous / public client | \`["anonymous"]\` | No client secret. PKCE with \`S256\` is mandatory. Suitable for all agents, because the resource is public. |
| Client credentials | \`["anonymous"]\` | No end-user involvement at all. A token is issued directly to the caller. |

MysticDo does not support ID-JAG identity assertions, verified-email
attestation, or any end-user identity assertion. There is no end user to
identify — the resource is public. Claims about a user's identity are therefore
neither requested nor accepted.

## Getting a token

### Client credentials (no user, no PKCE)

\`\`\`http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=mysticdo:read
\`\`\`

### Authorization code with PKCE

1. \`GET /oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=mysticdo:read&code_challenge=...&code_challenge_method=S256&state=...\`
2. The request is approved immediately. There is no consent screen, because
   there is nothing to consent to: the resource is public. The authorization
   response redirects to your \`redirect_uri\` with \`code\` and \`state\`.
3. \`POST /oauth/token\` with \`grant_type=authorization_code\`, \`code\`,
   \`code_verifier\`, \`client_id\` and \`redirect_uri\`.

Authorization codes live 60 seconds and are single-use per \`code_verifier\`.
Access tokens live 3600 seconds and are opaque strings.

## Using credentials

Send the token in the \`Authorization\` header:

\`\`\`http
POST /mcp HTTP/1.1
Host: mysticdo.com
Authorization: Bearer <access_token>
Content-Type: application/json
\`\`\`

\`bearer_methods_supported\` is \`["header"]\`. Query-parameter tokens are not
accepted. Requests without an \`Authorization\` header succeed anyway.

## Revocation

A token can be surrendered at \`POST /oauth/revoke\`
(\`token=<token>&token_type_hint=access_token\`), which always returns \`200\`.
Because tokens are stateless and the resource is public, revocation is
honour-system: it stops a well-behaved client from reusing a token but does not
gate access, and there is no server-side deny list to update. Do not rely on
revocation to protect anything — there is nothing to protect.

## Security contact

Report a vulnerability or an abuse concern through
https://mysticdo.com/contact.html. Please do not probe the registration or
authorization endpoints with automated load; they are unauthenticated by design
and rate limiting is intentionally lightweight.
`;
