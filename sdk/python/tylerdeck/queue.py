import queue
import threading
import time
import urllib.request
import json
import logging
from typing import Optional

logger = logging.getLogger("tylerdeck.sdk")

class AsyncTraceExporter:
    def __init__(self, api_key: str, endpoint: str, max_queue_size: int = 1000, timeout_seconds: float = 5.0, max_retries: int = 3):
        self.api_key = api_key
        self.endpoint = endpoint.rstrip('/')
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries
        self.queue = queue.Queue(maxsize=max_queue_size)
        self.running = True
        self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
        self.worker_thread.start()

    def enqueue(self, trace_payload: dict):
        try:
            self.queue.put_nowait(trace_payload)
        except queue.Full:
            logger.warning("TylerDeck SDK queue is full. Dropping trace payload to preserve application responsiveness.")

    def _worker_loop(self):
        while self.running:
            try:
                item = self.queue.get(timeout=1.0)
                if item:
                    self._send_payload_with_retries(item)
                    self.queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                # Fail-open guarantee: Telemetry errors never crash customer host applications
                pass

    def _send_payload_with_retries(self, payload: dict):
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

        backoff = 0.5
        for attempt in range(1, self.max_retries + 1):
            try:
                with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                    if 200 <= resp.status < 300:
                        return
            except Exception as exc:
                if attempt == self.max_retries:
                    logger.debug(f"TylerDeck SDK trace transmission failed after {attempt} attempts: {exc}")
                    return
                time.sleep(backoff)
                backoff *= 2.0

    def shutdown(self):
        self.running = False
        if self.worker_thread.is_alive():
            self.worker_thread.join(timeout=2.0)
