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
    chunk_id:int
    content:str
    
    class Config:
        from_attributes = True