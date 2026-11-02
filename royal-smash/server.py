#!/usr/bin/env python3
"""
Royal Smash 3D — High-Performance Multithreaded Dev Server
Serves the game with CORS, correct MIME types, and multi-client concurrency.

Supports simultaneous connections from multiple mobile phones, tablets & desktops.
"""
import http.server
import socketserver
import os
import sys
import mimetypes

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8181
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Ensure JavaScript ES modules are recognized properly
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/javascript', '.mjs')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/jpeg', '.jpg')
mimetypes.add_type('image/png', '.png')
mimetypes.add_type('application/json', '.json')

class RoyalSmashHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive stale caching
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        # Clean log output
        sys.stdout.write(f"  {self.address_string()} → {fmt % args}\n")
        sys.stdout.flush()

class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    server = ThreadingServer(('0.0.0.0', PORT), RoyalSmashHandler)
    print(f"\n🏰  Royal Smash 3D — Multithreaded Dev Server")
    print(f"   ✅  Local: http://localhost:{PORT}")
    try:
        import subprocess
        ip = subprocess.check_output(['ipconfig', 'getifaddr', 'en0']).decode().strip()
        print(f"   📱  Mobile Wi-Fi: http://{ip}:{PORT}")
    except Exception:
        pass
    print(f"   ⚡  Concurrent Multi-Device: READY\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋  Server stopped.")
