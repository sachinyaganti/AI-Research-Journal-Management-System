from pydantic import BaseModel, Field


class AIContentRequest(BaseModel):
    text: str = Field(..., min_length=100)


class AIContentResponse(BaseModel):
    ai_content_indicator: float
    human_writing_indicator: float
    confidence: str
    signals: list[str]
    explanation: str