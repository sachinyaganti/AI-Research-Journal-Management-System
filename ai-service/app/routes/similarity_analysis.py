from fastapi import APIRouter

from app.models.similarity_analysis import (
    SimilarityRequest,
    SimilarityResponse,
)
from app.services.similarity_analysis_service import analyze_similarity


router = APIRouter(
    prefix="/api/analysis",
    tags=["Similarity Analysis"],
)


@router.post(
    "/similarity",
    response_model=SimilarityResponse,
)
def similarity_analysis(
    request: SimilarityRequest,
):
    return analyze_similarity(request)