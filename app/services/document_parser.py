from pathlib import Path
from docx import Document as DocxDocument
from PyPDF2 import PdfReader

def extract_text(file_path:str):
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension ==".txt":
        return extract_txt(file_path)
    
    if extension ==".pdf":
        return extract_pdf(file_path)
    
    if extension ==".docx":
        return extract_docx(file_path)
    
    raise ValueError("Unsupported file type")

def extract_txt(file_path:str):
    with open(file_path,"r",encoding="utf-8")as f:
        return f.read()
    
def extract_pdf(file_path:str):
    reader = PdfReader(file_path)
    text_parts = []

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)

    return "\n".join(text_parts)

def extract_docx(file_path:str):
    document = DocxDocument(file_path)
    paragraphs = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            paragraphs.append(paragraph.text)

    return "\n".join(paragraphs)