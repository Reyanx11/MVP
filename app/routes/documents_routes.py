from fastapi import APIRouter,Depends,UploadFile,File,Form,HTTPException
from app.routes.auth_routes import require_admin,get_current_user
from app.models import User,Document,DocumentChunk
from app.schemas import DocumentResponse,DocumentChunkResponse
from app.database import get_db
from sqlalchemy.orm import Session
import shutil
import os
from app.services.document_parser import extract_text
from app.services.text_chunker import chunk_text

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
    
    os.makedirs("uploads",exist_ok=True)
    file_path = os.path.join("uploads",file.filename)

    with open(file_path,"wb")as f:
        shutil.copyfileobj(file.file,f)

    text = extract_text(file_path)
    chunks = chunk_text(text)



    document = Document(
        title = title,
        department = department,
        filename = file.filename,
        uploaded_by = current_user.username
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    for index,chunk in enumerate(chunks):
        db.add(DocumentChunk(
            document_id = document.id,
            chunk_index = index,
            content= chunk
        ))

    db.commit()
    return document

@router.get("/docs-list",response_model=list[DocumentResponse])
def list_documents(
    db:Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    if current_user.role == "Admin":
        return db.query(Document).all()
    
    return db.query(Document).filter(Document.department == current_user.role).all()

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

@router.get("/{document_id}/chunks",response_model=DocumentChunkResponse)
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