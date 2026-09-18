# pyrefly: ignore [missing-import]
from fastapi import FastAPI

from app.routes.manuscript_analysis import router as manuscript_analysis_router


app = FastAPI(
    title="Research Journal AI Service",
    description="AI services for research journal management",
    version="1.0.0",
)


app.include_router(manuscript_analysis_router)


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "Research Journal AI Service",
    }