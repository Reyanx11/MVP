from pydantic import BaseModel

####  AUTHENTICATION #####
class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


#### DOCUMENTATION ####

class DocumentResponse(BaseModel):
    id: int
    title: str
    department: str
    filename: str
    uploaded_by: str

    class Config:
        from_attributes = True

class DocumentChunkResponse(BaseModel):
    id:int
    document_id:int
    chunk_index:int
    content:str
    
    class Config:
        from_attributes = True

class SearchRequest(BaseModel):
    question:str
    top_k: int=5

class SearchResult(BaseModel):
    chunk_id: int
    document_id: int
    document_title: str
    department: str
    content:str
    distance: float

class ChatRequest(BaseModel):
    question: str
    top_k: int = 5


class ChatResponse(BaseModel):
    answer: str
    sources: list[SearchResult]
