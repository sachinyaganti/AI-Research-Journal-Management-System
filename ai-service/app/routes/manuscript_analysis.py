from fastapi import APIRouter

from app.models.manuscript_analysis import (
    ManuscriptAnalysisRequest,
    ManuscriptAnalysisResponse,
)
from app.services.manuscript_analysis_service import (
    analyze_manuscript,
)

router = APIRouter(
    prefix="/api/analysis",
    tags=["Manuscript Analysis"],
)


@router.post(
    "/manuscript",
    response_model=ManuscriptAnalysisResponse,
)
def analyze_manuscript_endpoint(
    request: ManuscriptAnalysisRequest,
):
    return analyze_manuscript(request)