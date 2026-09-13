#!/usr/bin/env python3
"""Contract module demo server.

Serves the static app AND persists application state server-side:
  GET  /api/state       -> data/state.json (204 if none yet)
  POST /api/state       -> saves the state atomically + keeps rolling backups
                           in data/backups/ (last 30)

All data lives on disk in the project folder and survives browser
cache/localStorage wipes.

Serves an explicit absolute directory.
Optional argv[1] overrides the port (default 8125).
"""
import os
import sys
import json
import time
import threading
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8125
DATA_DIR = os.path.join(ROOT, "data")
STATE_FILE = os.path.join(DATA_DIR, "state.json")
BACKUP_DIR = os.path.join(DATA_DIR, "backups")
KEEP_BACKUPS = 30

_LOCK = threading.Lock()


def _stored_saved_at():
    try:
        with open(STATE_FILE, "rb") as f:
            return json.load(f).get("__savedAt") or 0
    except Exception:
        return 0


LAST_SAVED_AT = _stored_saved_at()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def _api(self):
        return self.path.split("?")[0] == "/api/state"

    def _send_json(self, status, body, cors=False):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        if cors:
            self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self._api():
            if os.path.exists(STATE_FILE):
                with open(STATE_FILE, "rb") as f:
                    body = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                self.send_response(204)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
            return
        super().do_GET()

    def do_POST(self):
        global LAST_SAVED_AT
        if self._api():
            try:
                length = int(self.headers.get("Content-Length", "0"))
                body = self.rfile.read(length) if 0 < length <= 16 * 1024 * 1024 else None
            except Exception:
                body = None
            if not body:
                self._send_json(400, b"{\"error\":\"bad_request\"}", cors=True)
                return
            try:
                data = json.loads(body)
            except Exception:
                self._send_json(400, b"{\"error\":\"invalid_json\"}", cors=True)
                return

            client_saved_at = data.get("__savedAt") or 0
            with _LOCK:
                if client_saved_at and client_saved_at < LAST_SAVED_AT:
                    self._send_json(409, json.dumps({
                        "error": "stale_write",
                        "serverSavedAt": LAST_SAVED_AT,
                        "clientSavedAt": client_saved_at
                    }).encode(), cors=True)
                    return

                os.makedirs(DATA_DIR, exist_ok=True)
                os.makedirs(BACKUP_DIR, exist_ok=True)

                if os.path.exists(STATE_FILE):
                    ts_str = time.strftime("%Y%m%d-%H%M%S")
                    backup_fp = os.path.join(BACKUP_DIR, f"state-{ts_str}.json")
                    try:
                        with open(STATE_FILE, "rb") as src, open(backup_fp, "wb") as dst:
                            dst.write(src.read())
                    except Exception:
                        pass
                    try:
                        backups = sorted(os.listdir(BACKUP_DIR))
                        for old in backups[:-KEEP_BACKUPS]:
                            try:
                                os.remove(os.path.join(BACKUP_DIR, old))
                            except Exception:
                                pass
                    except Exception:
                        pass

                tmp_file = STATE_FILE + ".tmp"
                with open(tmp_file, "wb") as f:
                    f.write(body)
                os.replace(tmp_file, STATE_FILE)
                LAST_SAVED_AT = client_saved_at or int(time.time() * 1000)

            self._send_json(200, json.dumps({"ok": True, "savedAt": LAST_SAVED_AT}).encode(), cors=True)
            return

        self._send_json(404, b"{\"error\":\"not_found\"}", cors=True)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(BACKUP_DIR, exist_ok=True)
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(Handler))
    print(f"Contract demo on http://127.0.0.1:{PORT} (root={ROOT}, state={STATE_FILE})")
    httpd.serve_forever()
