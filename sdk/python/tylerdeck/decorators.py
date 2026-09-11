import functools
from typing import Callable, Optional
from tylerdeck.client import TylerDeck

def trace(name: Optional[str] = None, agent_id: str = "default_agent", version: str = "v1.0"):
    """
    Decorator for wrapping any Python function into a tracked TylerDeck trace.
    Example:
    @td.trace(name="customer_support_flow", agent_id="agent_01")
    def my_function(user_query):
        ...
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            client = TylerDeck.get_instance()
            trace_name = name or func.__name__
            if client:
                with client.trace(name=trace_name, agent_id=agent_id, agent_version=version) as tr:
                    if args:
                        tr.log_input(str(args[0]))
                    res = func(*args, **kwargs)
                    tr.log_output(str(res))
                    return res
            else:
                return func(*args, **kwargs)
        return wrapper
    return decorator
