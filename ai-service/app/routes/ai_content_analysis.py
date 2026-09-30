from fastapi import APIRouter

from app.models.ai_content_analysis import (
    AIContentRequest,
    AIContentResponse,
)

from app.services.ai_content_service import (
    analyze_ai_content,
)


router = APIRouter(
    prefix="/api/analysis",
    tags=["AI Content Analysis"],
)


@router.post(
    "/ai-content",
    response_model=AIContentResponse,
)
async def analyze_ai_generated_content(
    request: AIContentRequest,
):
    return analyze_ai_content(request)