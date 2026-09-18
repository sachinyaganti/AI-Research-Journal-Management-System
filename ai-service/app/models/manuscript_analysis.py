from pydantic import BaseModel, Field


class ManuscriptAnalysisRequest(BaseModel):
    title: str = Field(..., min_length=1)
    abstractText: str = Field(..., min_length=1)
    keywords: str = ""
    category: str = ""


class ManuscriptAnalysisResponse(BaseModel):
    title: str
    category: str

    abstract_word_count: int
    keyword_count: int

    abstract_quality: str
    methodology_quality: str
    results_quality: str
    conclusion_quality: str
    writing_quality: str
    relevance: str

    missing_sections: list[str]
    writing_issues: list[str]
    suggestions: list[str]