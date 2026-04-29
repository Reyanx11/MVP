from app.database import Base
from sqlalchemy import Column,Integer,String

class User(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key = True, index = True)
    username = Column(String,index = True, unique=True,nullable = False)
    hashed_password = Column(String,nullable = False)
    role = Column(String,nullable = False)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer,primary_key=True,index=True)
    title = Column(String, nullable=False, index=True)
    department = Column(String,nullable=False, index=True)
    filename = Column(String, index=True)
    uploaded_by = Column(String, nullable=False)

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(String, nullable=False)