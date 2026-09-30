from io import BytesIO

from pypdf import PdfReader


def extract_pdf_text(file_bytes: bytes) -> tuple[str, int]:
    """
    Extract text from a PDF.

    Returns:
        extracted_text: Combined text from all pages
        page_count: Number of pages
    """

    reader = PdfReader(BytesIO(file_bytes))

    page_text = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            page_text.append(text)

    extracted_text = "\n\n".join(page_text).strip()

    return extracted_text, len(reader.pages)