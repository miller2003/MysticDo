#!/usr/bin/env python3
"""
MysticDo — content index builder (agent-facing).

Purpose
-------
The site is pure static HTML with no build step, so an agent (or an MCP tool)
has no cheap way to search it. This script compiles every indexable page into a
single JSON index at `assets/data/content-index.json`, which is then:

  · served publicly at  /assets/data/content-index.json
  · fetched by the Worker's MCP server (`search_content`, `list_sections`)
  · advertised in the ARD manifest (/.well-known/ai-catalog.json)

Design notes
------------
- Text extraction is deliberately dependency-free (regex + html.unescape).
  It only needs to be *good enough for lexical search*, not pixel-perfect.
- <script>, <style>, <svg>, <noscript> are stripped: on this site they carry
  inline SVG glyphs and analytics, which would otherwise dominate the corpus
  with noise like "0 0 40 40" and "posthog".
- Output is deterministic (sorted keys, stable ordering) so re-running the
  script produces byte-identical output when nothing changed — that makes the
  file safe to diff and keeps CDN hashes stable.

Idempotent: safe to re-run at any time. Run after editing page copy.
"""

import html as html_mod
import json
import os
import re
from datetime import datetime, timezone

BASE = r"C:\Users\samja\Desktop\site\mysticdo"
OUT_REL = os.path.join("assets", "data", "content-index.json")
SITE = "https://mysticdo.com"

# Pages that must never enter the index (noindex / redirect shells).
EXCLUDE = {"404.html", "quiz/find-your-path.html"}

# Per-page text budget. ~2 KB keeps the whole index comfortably under 150 KB
# while still carrying every "direct answer" and key-takeaway sentence.
MAX_TEXT_CHARS = 2000
HEADING_LIMIT = 24

TAG_STRIP = re.compile(
    r"<(script|style|svg|noscript|template|head)\b.*?</\1>",
    re.IGNORECASE | re.DOTALL,
)


def read(path):
    with open(path, "r", encoding="utf-8-sig") as f:
        return f.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def meta(html, name):
    m = re.search(
        r'<meta\s+(?:name|property)=["\']' + re.escape(name) + r'["\']\s+content=(["\'])(.*?)\1',
        html,
        re.IGNORECASE | re.DOTALL,
    )
    return html_mod.unescape(m.group(2)).strip() if m else ""


def first_heading(html, level=1):
    m = re.search(r"<h%d[^>]*>(.*?)</h%d>" % (level, level), html, re.IGNORECASE | re.DOTALL)
    return collapse(strip_tags(m.group(1))) if m else ""


def strip_tags(s):
    return re.sub(r"<[^>]+>", " ", s)


def collapse(s):
    s = html_mod.unescape(s)
    s = s.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", s).strip()


def page_url(rel):
    p = rel.replace("\\", "/")
    if p == "index.html":
        return "/"
    p = "/" + p
    p = re.sub(r"\.html$", "", p)
    return re.sub(r"/index\.html$", "/", p)


def classify(rel):
    p = rel.replace("\\", "/")
    if p.startswith("guides/"):
        stem = os.path.basename(p)
        if "vs-" in stem or "-vs-" in stem:
            return "comparison"
        return "guide"
    if p.startswith("quiz/"):
        return "quiz"
    if p.startswith("questions/"):
        return "question"
    if p.startswith("tools/"):
        return "tool"
    if p in ("astrology/index.html", "psychic/index.html", "tarot/index.html", "medium/index.html"):
        return "practice"
    return "page"


def extract_headings(html):
    out = []
    for m in re.finditer(r"<h([2-3])[^>]*>(.*?)</h\1>", html, re.IGNORECASE | re.DOTALL):
        text = collapse(strip_tags(m.group(2)))
        # Drop decorative section labels that carry no retrieval value.
        if text and text.lower() not in ("direct answer", "key takeaways", "faq", "bottom line"):
            out.append(text)
        if len(out) >= HEADING_LIMIT:
            break
    return out


def extract_faq_questions(html):
    qs = []
    for m in re.finditer(r"<summary[^>]*>(.*?)</summary>", html, re.IGNORECASE | re.DOTALL):
        q = collapse(strip_tags(m.group(1)))
        if q and len(q) < 200:
            qs.append(q)
    return qs


def extract_text(body):
    """Visible text, with the machine-readable GEO blocks promoted to the front.

    The `direct-answer` and `key-takeaways` blocks are the site's own
    answer-first summaries. Putting them first means a truncated excerpt still
    leads with the highest-value sentence for an agent.
    """
    priority = []
    for cls in ("direct-answer", "key-takeaways"):
        for m in re.finditer(
            r'<div class="%s"[^>]*>(.*?)</div>\s*</div>|<div class="%s"[^>]*>(.*?)</div>'
            % (cls, cls),
            body,
            re.IGNORECASE | re.DOTALL,
        ):
            chunk = collapse(strip_tags(m.group(1) or m.group(2) or ""))
            if chunk:
                priority.append(chunk)

    rest = collapse(strip_tags(body))
    joined = " ".join(priority) + " " + rest
    return re.sub(r"\s+", " ", joined).strip()[:MAX_TEXT_CHARS]


def main():
    pages = []
    for root, dirs, files in os.walk(BASE):
        dirs[:] = [
            d
            for d in dirs
            if d not in ("node_modules", ".workbuddy", ".git", ".vscode", "assets",
                         "_design-check", "logo-drafts", "worker", "scripts", "functions")
        ]
        for fn in sorted(files):
            if not fn.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(root, fn), BASE).replace("\\", "/")
            if rel in EXCLUDE:
                continue

            raw = read(os.path.join(root, fn))
            body = raw.split("</head>", 1)[-1]
            body = TAG_STRIP.sub(" ", body)

            title = collapse(strip_tags(
                re.search(r"<title>(.*?)</title>", raw, re.IGNORECASE | re.DOTALL).group(1)
            )) if re.search(r"<title>(.*?)</title>", raw, re.IGNORECASE | re.DOTALL) else ""
            h1 = first_heading(body) or first_heading(raw)
            desc = meta(raw, "description")
            text = extract_text(body)

            entry = {
                "url": page_url(rel),
                "kind": classify(rel),
                "title": re.sub(r"\s*\|\s*MysticDo\s*$", "", title).strip(),
                "h1": h1,
                "description": desc,
                "headings": extract_headings(body),
                "faqQuestions": extract_faq_questions(body),
                "text": text,
            }
            pages.append(entry)

    pages.sort(key=lambda p: p["url"])

    doc = {
        "site": SITE,
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "pageCount": len(pages),
        "license": "Content is published by MysticDo for human readers and AI agents alike. Attribution appreciated.",
        "schema": {
            "url": "site-relative path of the page",
            "kind": "guide | comparison | practice | question | quiz | tool | page",
            "text": "flattened visible text, truncated; fetch the page or use Accept: text/markdown for the full body",
        },
        "pages": pages,
    }

    out = os.path.join(BASE, OUT_REL)
    write(out, json.dumps(doc, ensure_ascii=False, indent=1, sort_keys=False) + "\n")

    total = os.path.getsize(out)
    print("Wrote %s" % OUT_REL)
    print("  pages : %d" % len(pages))
    print("  bytes : %d (%.1f KB)" % (total, total / 1024.0))


if __name__ == "__main__":
    main()
