import os
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import User
from apps.api.schemas import PlaygroundRunRequest, PlaygroundRunResponse
from apps.api.auth import get_current_user
from apps.api.pricing import calculate_llm_cost

router = APIRouter(prefix="/playground", tags=["Playground"])

@router.post("/run", response_model=PlaygroundRunResponse)
def run_playground(
    payload: PlaygroundRunRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    
    # Substitute variables into prompt content
    rendered_prompt = payload.prompt_content
    for k, v in payload.input_variables.items():
        rendered_prompt = rendered_prompt.replace(f"{{{{{k}}}}}", str(v))
        rendered_prompt = rendered_prompt.replace(f"{{{k}}}", str(v))

    response_text = ""
    prompt_tokens = max(10, len(rendered_prompt.split()) * 2)
    completion_tokens = 0
    
    provider_lower = payload.provider.lower()
    
    # Attempt real provider invocation if keys are in environment
    if provider_lower == "openai" and os.environ.get("OPENAI_API_KEY"):
        try:
            import openai
            client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
            res = client.chat.completions.create(
                model=payload.model,
                messages=[{"role": "user", "content": rendered_prompt}],
                temperature=payload.temperature
            )
            response_text = res.choices[0].message.content or ""
            prompt_tokens = res.usage.prompt_tokens if res.usage else prompt_tokens
            completion_tokens = res.usage.completion_tokens if res.usage else len(response_text.split()) * 2
        except Exception as exc:
            response_text = f"[API Call Execution Error: {exc}]"
            completion_tokens = 15
    elif provider_lower == "anthropic" and os.environ.get("ANTHROPIC_API_KEY"):
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
            res = client.messages.create(
                model=payload.model,
                max_tokens=500,
                temperature=payload.temperature,
                messages=[{"role": "user", "content": rendered_prompt}]
            )
            response_text = res.content[0].text if res.content else ""
            completion_tokens = res.usage.output_tokens if hasattr(res, 'usage') else len(response_text.split()) * 2
        except Exception as exc:
            response_text = f"[API Call Execution Error: {exc}]"
            completion_tokens = 15
    else:
        # Deterministic simulation engine when provider API credentials are not set in local env
        response_text = f"Simulated response from {payload.provider.upper()} ({payload.model}) for prompt:\n'{rendered_prompt}'\n\n[To invoke live LLM endpoints, set {payload.provider.upper()}_API_KEY environment variable]."
        completion_tokens = max(15, len(response_text.split()) * 2)

    latency_ms = round((time.time() - start_time) * 1000.0 + 120.0, 2)
    cost = calculate_llm_cost(payload.model, prompt_tokens, completion_tokens)

    return PlaygroundRunResponse(
        response_text=response_text,
        latency_ms=latency_ms,
        input_tokens=prompt_tokens,
        output_tokens=completion_tokens,
        cost_usd=cost,
        provider=payload.provider,
        model=payload.model
    )
