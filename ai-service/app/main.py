from fastapi import FastAPI

from app.routes.manuscript_analysis import (
    router as manuscript_analysis_router,
)

from app.routes.similarity_analysis import (
    router as similarity_analysis_router,
)

from app.routes.pdf_screening import (
    router as pdf_screening_router,
)


app = FastAPI(
    title="Research Journal AI Service",
    description="AI services for research journal management",
    version="1.0.0",
)


app.include_router(manuscript_analysis_router)

app.include_router(similarity_analysis_router)

app.include_router(pdf_screening_router)


@app.get("/health")
def health_check():

    return {
        "status": "UP",
        "service": "Research Journal AI Service",
    }