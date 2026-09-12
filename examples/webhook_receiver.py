#!/usr/bin/env python3
"""
TylerDeck Signed Webhook Receiver Demo & Signature Verification Script

Starts a lightweight HTTP server that listens for incoming TylerDeck webhook webhooks (e.g. regression.detected).
Verifies HMAC-SHA256 signature passed in the 'X-TylerDeck-Signature' header.

Usage:
  python3 examples/webhook_receiver.py --port 9000 --secret whsec_mysecret123
"""

import hmac
import json
import argparse
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler

class WebhookHandler(BaseHTTPRequestHandler):
    signing_secret = "whsec_demo_secret_key_12345"

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        signature_header = self.headers.get('X-TylerDeck-Signature', '')
        print(f"\n=======================================================")
        print(f"📥 Received Webhook POST Event on path: {self.path}")
        print(f"   Signature Header: {signature_header}")

        # Signature verification logic
        # Header format: t=<timestamp>,v1=<signature>
        is_valid = False
        try:
            if signature_header:
                parts = dict(item.split('=') for item in signature_header.split(','))
                timestamp = parts.get('t', '')
                provided_sig = parts.get('v1', '')

                # Recompute HMAC-SHA256 signature over payload
                expected_sig = hmac.new(
                    self.signing_secret.encode('utf-8'),
                    post_data,
                    hashlib.sha256
                ).hexdigest()

                is_valid = hmac.compare_digest(expected_sig, provided_sig)
        except Exception as e:
            print(f"   Signature parsing error: {e}")

        payload_json = {}
        try:
            payload_json = json.loads(post_data.decode('utf-8'))
        except Exception:
            payload_json = {"raw": post_data.decode('utf-8')}

        print(f"   HMAC Verification Result: {'✅ VERIFIED (VALID SIGNATURE)' if is_valid else '❌ INVALID SIGNATURE'}")
        print(f"   Event Type: {payload_json.get('event_type', 'unknown')}")
        print(f"   Timestamp: {payload_json.get('timestamp', 'unknown')}")
        print(f"   Payload:\n{json.dumps(payload_json, indent=4)}")
        print(f"=======================================================\n")

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "received", "signature_valid": is_valid}).encode('utf-8'))

    def log_message(self, format, *args):
        return  # Suppress standard HTTP server logs to keep console output clean

def run_receiver(port: int = 9000, secret: str = "whsec_demo_secret_key_12345"):
    WebhookHandler.signing_secret = secret
    server_address = ('', port)
    httpd = HTTPServer(server_address, WebhookHandler)
    print(f"📡 TylerDeck Webhook Receiver active on http://localhost:{port}")
    print(f"   Configured HMAC Signing Secret: '{secret}'")
    print("   Press Ctrl+C to stop.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Webhook Receiver.")
        httpd.server_close()

def main():
    parser = argparse.ArgumentParser(description="TylerDeck Signed Webhook Receiver Demo")
    parser.add_argument("--port", type=int, default=9000, help="Port to listen on (default: 9000)")
    parser.add_argument("--secret", default="whsec_demo_secret_key_12345", help="Signing secret for HMAC validation")
    args = parser.parse_args()

    run_receiver(port=args.port, secret=args.secret)

if __name__ == "__main__":
    main()
