#!/usr/bin/env python3
"""
Local preview server that mimics Cloudflare Workers static-asset URL behavior.

Why it exists: production runs `html_handling: "auto-trailing-slash"`, which
serves extension-less URLs (/about serves about.html) and 308s /about.html
to /about. Python's plain http.server does neither, so after the clean-URL
migration every internal link would 404 on localhost. This server restores
parity with production so local QA (and _design-check tooling) keeps working.

Usage:
    python scripts/serve.py [port]          # default 8765
    then open http://localhost:8765

Behavior (mirrors Cloudflare):
    /                    -> index.html
    /psychic/            -> psychic/index.html
    /psychic             -> 308 -> /psychic/          (dir without slash)
    /about               -> about.html (200, clean URL)
    /about.html          -> 308 -> /about             (extension dropped)
    /assets/...          -> served as-is
    anything missing     -> 404.html with 404 status
"""
import os
import posixpath
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class CFLikeHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (self.address_string() + " " + (fmt % args)))

    # -- helpers ----------------------------------------------------------

    def _resolve(self, path):
        """Map a URL path to a file on disk, or None.

        Follows Cloudflare's resolution order for auto-trailing-slash:
        1. exact file match
        2. <path>/index.html  (directory URLs keep their trailing slash)
        3. <path>.html        (extension-less URLs serve the .html file)
        """
        path = posixpath.normpath(unquote(path)).lstrip("/")
        if path in ("", "."):
            return os.path.join(ROOT, "index.html")
        full = os.path.join(ROOT, path.replace("/", os.sep))
        if os.path.isfile(full):
            return full
        if os.path.isfile(os.path.join(full, "index.html")):
            return os.path.join(full, "index.html")
        if os.path.isfile(full + ".html"):
            return full + ".html"
        return None

    # -- routing ----------------------------------------------------------

    def do_GET(self):
        path = self.path.split("#", 1)[0]
        # strip query string for file resolution but keep it out of redirects
        nopath = path.split("?", 1)[0]

        # .html requests are redirected to the clean URL (CF parity)
        if nopath.endswith(".html"):
            clean = nopath[: -len(".html")]
            target = self._clean_target(clean)
            self.send_response(308)
            self.send_header("Location", target)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        # a directory path without trailing slash -> add it (CF parity)
        if not nopath.endswith("/"):
            with_index = self._resolve(nopath + "/")
            if with_index and with_index.endswith("index.html") and self._resolve(nopath) == with_index:
                self.send_response(308)
                self.send_header("Location", nopath + "/")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

        f = self._resolve(nopath)
        if f is None:
            # 404 page with 404 status (CF not_found_handling parity)
            nf = os.path.join(ROOT, "404.html")
            if os.path.isfile(nf):
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                size = os.path.getsize(nf)
                self.send_header("Content-Length", str(size))
                self.end_headers()
                with open(nf, "rb") as fh:
                    self.wfile.write(fh.read())
                return
            self.send_error(404, "File not found")
            return

        self._serve_file(f)

    do_HEAD = do_GET

    def _clean_target(self, clean):
        """Keep fragment/query on redirects to the clean URL."""
        rest = self.path.split("?", 1)[1] if "?" in self.path else ""
        frag = self.path.split("#", 1)[1] if "#" in self.path else ""
        # resolve to a directory (with trailing slash) when needed
        f = self._resolve(clean)
        if f and f.endswith("index.html") and not clean.endswith("/"):
            clean = clean + "/"
        target = clean
        if rest:
            target += "?" + rest
        if frag:
            target += "#" + frag
        return target

    def _serve_file(self, f):
        ctype = self.guess_type(f)
        try:
            size = os.path.getsize(f)
        except OSError:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(size))
        self.send_header("Cache-Control", "no-store")  # dev server: always fresh
        self.end_headers()
        if self.command == "GET":
            with open(f, "rb") as fh:
                while True:
                    chunk = fh.read(64 * 1024)
                    if not chunk:
                        break
                    self.wfile.write(chunk)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    server = ThreadingHTTPServer(("127.0.0.1", port), CFLikeHandler)
    print(f"MysticDo preview (CF-like URLs) -> http://localhost:{port}")
    print("  /about serves about.html | /about.html 308s to /about")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")


if __name__ == "__main__":
    main()
