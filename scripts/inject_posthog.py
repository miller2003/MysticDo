#!/usr/bin/env python3
"""
MysticDo PostHog analytics injector.

Injects the official PostHog JS snippet (https://posthog.com/docs) into every
HTML page's <head>. Idempotent: re-running replaces the previously injected
block, so updating the API key / host only requires running it again.

Usage (from project root):
  python scripts/inject_posthog.py --key phc_xxxxxxxxxxxx --host https://us.i.posthog.com
  python scripts/inject_posthog.py                 # inject with placeholder key
  python scripts/inject_posthog.py --remove        # strip the block from all pages
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Directories that never contain deployable HTML pages.
# email-templates is excluded on purpose: scripts inside emails are useless
# (clients strip them) and hurt deliverability.
EXCLUDE_DIRS = {
    ".workbuddy", ".astro", ".git", "node_modules",
    "_design-check", "logo-drafts", "scripts", "assets", "functions", "worker",
    "email-templates",
}

START = "<!-- POSTHOG-ANALYTICS-START (managed by scripts/inject_posthog.py) -->"
END = "<!-- POSTHOG-ANALYTICS-END -->"

DEFAULT_KEY = "__POSTHOG_PROJECT_API_KEY__"
DEFAULT_HOST = "https://us.i.posthog.com"  # EU cloud: https://eu.i.posthog.com

# Official snippet from https://posthog.com/docs/getting-started/install
# (bootstrap + init). KEY/HOST are substituted at injection time.
SNIPPET = """<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('__KEY__', {
        api_host: '__HOST__',
        defaults: '2026-05-30',
    })
</script>"""


def iter_html_files():
    for p in sorted(ROOT.rglob("*.html")):
        if any(part in EXCLUDE_DIRS for part in p.relative_to(ROOT).parts):
            continue
        yield p


def build_block(key: str, host: str) -> str:
    return START + "\n" + SNIPPET.replace("__KEY__", key).replace("__HOST__", host) + "\n" + END


def strip_block(html: str) -> str:
    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.DOTALL)
    return pattern.sub("", html)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--key", default=DEFAULT_KEY, help="PostHog Project API key (phc_...)")
    ap.add_argument("--host", default=DEFAULT_HOST, help="PostHog ingestion host (US or EU)")
    ap.add_argument("--remove", action="store_true", help="remove injected block from all pages")
    args = ap.parse_args()

    if not args.remove and args.key == DEFAULT_KEY:
        print("[!] Injecting with PLACEHOLDER key. Data will NOT be captured until you")
        print("    re-run with --key phc_... (Settings -> Project API key in PostHog).")

    injected = updated = removed = skipped = 0
    block = build_block(args.key, args.host)

    for path in iter_html_files():
        html = path.read_text(encoding="utf-8")
        had_block = START in html
        if args.remove:
            if had_block:
                path.write_text(strip_block(html), encoding="utf-8")
                removed += 1
            continue
        html = strip_block(html)  # idempotent: drop old block first
        m = re.search(r"</head\s*>", html, re.IGNORECASE)
        if not m:
            print(f"[skip] no </head> found: {path.relative_to(ROOT)}")
            skipped += 1
            continue
        html = html[: m.start()] + block + "\n" + html[m.start():]
        path.write_text(html, encoding="utf-8")
        if had_block:
            updated += 1
        else:
            injected += 1

    if args.remove:
        print(f"Removed PostHog block from {removed} page(s).")
    else:
        print(f"Injected: {injected} new | updated: {updated} | skipped: {skipped}")
        print(f"Key   : {args.key}")
        print(f"Host  : {args.host}")
        if args.key == DEFAULT_KEY:
            print("\nNEXT STEP: re-run with your real key, e.g.:")
            print('  python scripts/inject_posthog.py --key phc_YOURKEY --host https://us.i.posthog.com')
    return 0


if __name__ == "__main__":
    sys.exit(main())
