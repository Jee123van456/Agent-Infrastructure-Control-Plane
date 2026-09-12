import uuid
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from contextlib import ContextDecorator

from tylerdeck.queue import AsyncTraceExporter
from tylerdeck.redactor import sanitize_data

_global_td_instance: Optional['TylerDeck'] = None

class TraceContext:
    def __init__(self, client: 'TylerDeck', name: str, agent_id: str, agent_version: str = "v1.0", user_id: Optional[str] = None):
        self.client = client
        self.name = name
        self.agent_id = agent_id
        self.agent_version = agent_version
        self.user_id = user_id
        self.trace_id = str(uuid.uuid4())
        self.start_time = time.time()
        self.events: List[dict] = []
        self.status = "SUCCESS"
        self.error_message = None
        self.input_text = None
        self.output_text = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (time.time() - self.start_time) * 1000.0
        if exc_type is not None:
            self.status = "ERROR"
            self.error_message = str(exc_val)
            self.log_event("error", "Exception Caught", inputs={"exception_type": exc_type.__name__}, outputs={"message": str(exc_val)}, status="ERROR")

        payload = {
            "agent_id": self.agent_id,
            "agent_version": self.agent_version,
            "trace_id": self.trace_id,
            "name": self.name,
            "environment": self.client.environment,
            "user_id": self.user_id,
            "input_text": sanitize_data(self.input_text),
            "output_text": sanitize_data(self.output_text),
            "total_duration_ms": round(duration_ms, 2),
            "status": self.status,
            "error_message": self.error_message,
            "events": sanitize_data(self.events)
        }
        self.client.exporter.enqueue(payload)
        return False  # Do not suppress exception if any

    def log_input(self, text: str):
        self.input_text = text

    def log_output(self, text: str):
        self.output_text = text

    def log_event(self, event_type: str, name: str, inputs: Optional[dict] = None, outputs: Optional[dict] = None, duration_ms: float = 0.0, status: str = "SUCCESS"):
        self.events.append({
            "event_type": event_type,
            "name": name,
            "duration_ms": duration_ms,
            "inputs": inputs or {},
            "outputs": outputs or {},
            "status": status
        })

    def log_llm_call(self, provider: str, model: str, prompt_tokens: int, completion_tokens: int, temperature: float = 0.7):
        self.events.append({
            "event_type": "llm_call",
            "name": f"LLM: {provider}/{model}",
            "duration_ms": 450.0,
            "status": "SUCCESS",
            "llm_call": {
                "provider": provider,
                "model": model,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "temperature": temperature
            }
        })

    def log_tool_call(self, tool_name: str, tool_category: str = "general", arguments: Optional[dict] = None, result: Optional[dict] = None, execution_time_ms: float = 0.0, status: str = "SUCCESS", error_details: Optional[str] = None):
        if status != "SUCCESS":
            self.status = "ERROR"
            if error_details:
                self.error_message = f"Tool '{tool_name}' failed: {error_details}"

        self.events.append({
            "event_type": "tool_call",
            "name": f"Tool: {tool_name}",
            "duration_ms": execution_time_ms,
            "status": status,
            "tool_call": {
                "tool_name": tool_name,
                "tool_category": tool_category,
                "arguments": arguments or {},
                "result": result or {},
                "execution_time_ms": execution_time_ms,
                "status": status,
                "error_details": error_details
            }
        })

class TylerDeck:
    def __init__(self, api_key: str, endpoint: str = "http://localhost:8000", environment: str = "production", fail_open: bool = True):
        global _global_td_instance
        self.api_key = api_key
        self.endpoint = endpoint
        self.environment = environment
        self.fail_open = fail_open
        self.exporter = AsyncTraceExporter(api_key=api_key, endpoint=endpoint, fail_open=fail_open)
        _global_td_instance = self

    def trace(
        self,
        name: str,
        agent_id: str = "default_agent",
        agent_version: str = "v1.0",
        agent: Optional[str] = None,
        version: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> TraceContext:
        resolved_agent = agent or agent_id
        resolved_version = version or agent_version
        return TraceContext(self, name=name, agent_id=resolved_agent, agent_version=resolved_version, user_id=user_id)

    @classmethod
    def get_instance(cls) -> Optional['TylerDeck']:
        return _global_td_instance
