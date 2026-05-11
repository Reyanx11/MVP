import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
model = SentenceTransformer(EMBEDDING_MODEL, local_files_only=True)
# 384 dimensions

def embed_text(text:str):
    embedding = model.encode(text)
    return embedding.tolist()

def embed_texts(texts:list[str]):
    embeddings = model.encode(texts)
    return embeddings.tolist()
