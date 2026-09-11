import queue
import threading
import time
import urllib.request
import json
import logging
from typing import Optional

logger = logging.getLogger("tylerdeck.sdk")

class AsyncTraceExporter:
    def __init__(self, api_key: str, endpoint: str, max_queue_size: int = 1000, batch_size: int = 10):
        self.api_key = api_key
        self.endpoint = endpoint.rstrip('/')
        self.queue = queue.Queue(maxsize=max_queue_size)
        self.batch_size = batch_size
        self.running = True
        self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
        self.worker_thread.start()

    def enqueue(self, trace_payload: dict):
        try:
            self.queue.put_nowait(trace_payload)
        except queue.Full:
            logger.warning("TylerDeck SDK queue is full. Dropping trace to maintain application performance.")

    def _worker_loop(self):
        while self.running:
            try:
                item = self.queue.get(timeout=1.0)
                if item:
                    self._send_payload(item)
                    self.queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                # Fail-open: Never let SDK errors disrupt host process
                pass

    def _send_payload(self, payload: dict):
        url = f"{self.endpoint}/api/v1/traces"
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                pass
        except Exception:
            # Fail-open gracefully
            pass

    def shutdown(self):
        self.running = False
        if self.worker_thread.is_alive():
            self.worker_thread.join(timeout=2.0)
