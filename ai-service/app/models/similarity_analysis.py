from pydantic import BaseModel, Field


class SimilarityCandidate(BaseModel):
    manuscript_id: int = Field(..., gt=0)
    title: str = Field(..., min_length=1)
    abstractText: str = Field(..., min_length=1)

    # Full extracted PDF text
    full_text: str = ""


class SimilarityRequest(BaseModel):
    manuscript_id: int = Field(..., gt=0)
    title: str = Field(..., min_length=1)
    abstractText: str = Field(..., min_length=1)

    # Full extracted PDF text of the current manuscript
    full_text: str = ""

    candidates: list[SimilarityCandidate] = []


class SimilarityMatch(BaseModel):
    manuscript_id: int
    title: str
    similarity_percentage: float


class SimilarityResponse(BaseModel):
    manuscript_id: int
    similarity_percentage: float
    status: str
    matches: list[SimilarityMatch]