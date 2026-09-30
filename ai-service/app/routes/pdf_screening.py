from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.pdf_extraction_service import extract_pdf_text


router = APIRouter(
    prefix="/api/analysis",
    tags=["PDF Screening"],
)


@router.post("/screen-pdf")
async def screen_pdf(
    file: UploadFile = File(...),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="PDF file name is required",
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty",
        )

    try:
        extracted_text, page_count = extract_pdf_text(
            file_bytes
        )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read PDF: {str(exc)}",
        )

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail=(
                "No readable text was found in the PDF. "
                "The PDF may contain scanned images only."
            ),
        )

    return {
        "file_name": file.filename,
        "page_count": page_count,
        "character_count": len(extracted_text),
        "extracted_text": extracted_text,
    }