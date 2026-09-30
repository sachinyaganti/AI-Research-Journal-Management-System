from pydantic import BaseModel


class PDFScreeningResponse(BaseModel):
    file_name: str
    page_count: int
    character_count: int
    extracted_text: str