# TYLERDECK PYTHON SDK SPECIFICATION

## Installation
```bash
pip install tylerdeck
```

## Quick Usage
```python
from tylerdeck import TylerDeck

td = TylerDeck(api_key="td_live_9f8a3c4b1e5d6f7a8b9c0d1e2f3a4b5c")

@td.trace(name="customer_support_flow", agent_id="support_agent", version="v1.5")
def run_agent(query: str):
    td.log_llm_call(provider="openai", model="gpt-4o", prompt_tokens=1400, completion_tokens=250)
    td.log_tool_call(tool_name="customer_db_search", arguments={"order_id": "ORD-9912"}, result={"status": "delivered"}, execution_time_ms=180.0)
    return "Your order has been delivered."
```
