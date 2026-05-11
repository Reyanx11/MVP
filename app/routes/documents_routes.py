from fastapi import APIRouter,Depends,UploadFile,File,Form,HTTPException
from app.routes.auth_routes import require_admin,get_current_user
from app.models import User,Document,DocumentChunk
from app.schemas import DocumentResponse,DocumentChunkResponse,SearchRequest,SearchResult
from app.database import get_db
from sqlalchemy.orm import Session
import shutil
import os
from pathlib import Path
from app.services.document_parser import extract_text
from app.services.text_chunker import chunk_text
from app.services.embeddings import embed_texts,embed_text
from app.services.vector_store import add_embeddings,search_embedding


router = APIRouter(prefix="/documents",tags=["documents"])

@router.get("/admin-check")
def admin_check(current_user: User = Depends(require_admin)):
    return{
        "message": "Admin access confirmed",
        "username": current_user.username,
        "role": current_user.role
    }


@router.post("/upload",response_model= DocumentResponse)
def upload_document(title: str = Form(...),
                    department: str = Form(...),
                    file: UploadFile = File(...),
                    db: Session= Depends(get_db),
                    current_user: User = Depends(require_admin)):
    
    upload_dir = Path("C:/Users/reyan/AppData/Local/MVP/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_filename = Path(file.filename).name
    file_path = str(upload_dir / safe_filename)

    with open(file_path,"wb")as f:
        shutil.copyfileobj(file.file,f)

    text = extract_text(file_path)
    chunks = chunk_text(text)



    document = Document(
        title = title,
        department = department,
        filename = safe_filename,
        uploaded_by = current_user.username
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    saved_chunks = []

    for index,chunk in enumerate(chunks):
        document_chunk = (DocumentChunk(
            document_id = document.id,
            chunk_index = index,
            content= chunk
        ))
        db.add(document_chunk)
        saved_chunks.append(document_chunk)
    db.commit()

    for document_chunk in saved_chunks:
        db.refresh(document_chunk)

    chunk_ids = [document_chunk.id for document_chunk in saved_chunks]
    embeddings = embed_texts(chunks)

    add_embeddings(chunk_ids, embeddings)

    return document

@router.get("/docs-list",response_model=list[DocumentResponse])
def list_documents(
    db:Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    if current_user.role == "Admin":
        return db.query(Document).all()
    
    return db.query(Document).filter(Document.department == current_user.role).all()

@router.post("/search", response_model=list[SearchResult])
def search_documents(
    request: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question_embedding = embed_text(request.question)
    vector_results = search_embedding(question_embedding, request.top_k)

    results = []

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

        results.append({
            "chunk_id": chunk.id,
            "document_id": document.id,
            "document_title": document.title,
            "department": document.department,
            "content": chunk.content,
            "distance": vector_result["distance"]
        })

    return results


@router.get("/{document_id}",response_model=DocumentResponse)
def get_document(
    document_id:int,
    db:Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document: 
        raise HTTPException(status_code=404,detail="Document not found")
    
    if current_user.role != "Admin" and document.department != current_user.role:
        raise HTTPException(status_code=403, detail="Not allowed to access this document")
    
    return document

@router.get("/{document_id}/chunks",response_model= list[DocumentChunkResponse])
def get_document_chunks(
    document_id: int,
    db: Session = Depends(get_db),
    current_user : User= Depends(get_current_user)
):
    
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if current_user.role != "Admin" and document.department != current_user.role:
        raise HTTPException(status_code=403, detail= "Not allowed to accesss this document")
    
    return db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index).all()

