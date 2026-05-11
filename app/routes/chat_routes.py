from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Document, DocumentChunk
from app.routes.auth_routes import get_current_user
from app.schemas import ChatRequest, ChatResponse
from app.services.embeddings import embed_text
from app.services.llm_service import generate_answer
from app.services.vector_store import search_embedding


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/ask", response_model=ChatResponse)
def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question_embedding = embed_text(request.question)
    vector_results = search_embedding(question_embedding, request.top_k)
    
    sources = []
    context_chunks = []

    for vector_result in vector_results:
        chunk = db.query(DocumentChunk).filter(
            DocumentChunk.id == vector_result["chunk_id"]
        ).first()

        if not chunk:
            continue

        document = db.query(Document).filter(
            Document.id == chunk.document_id
        ).first()

        if not document:
            continue

        if current_user.role != "Admin" and document.department != current_user.role:
            continue

        context_chunks.append(chunk.content)

        sources.append({
            "chunk_id": chunk.id,
            "document_id": document.id,
            "document_title": document.title,
            "department": document.department,
            "content": chunk.content,
            "distance": vector_result["distance"]
        })
    if not context_chunks:
        return {
            "answer": "I don't know based on the uploaded documents.",
            "sources": sources
        }

    try:
        answer = generate_answer(request.question, context_chunks)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM request failed: {exc}") from exc
    return {
        "answer": answer,
        "sources": sources
    }
