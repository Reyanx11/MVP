import json
import os
import faiss
import numpy as np
from dotenv import load_dotenv

load_dotenv()

VECTOR_DIR = os.getenv("VECTOR_STORE_DIR")
INDEX_PATH = os.path.join(VECTOR_DIR, "index.faiss")
CHUNK_IDS_PATH = os.path.join(VECTOR_DIR, "chunk_ids.json")
EMBEDDING_DIMENSION = 384

def load_index():
    os.makedirs(VECTOR_DIR,exist_ok=True)

    if os.path.exists(INDEX_PATH):
        return faiss.read_index(INDEX_PATH)

    return faiss.IndexFlatL2(EMBEDDING_DIMENSION)

def save_index(index):
    os.makedirs(VECTOR_DIR,exist_ok=True)
    faiss.write_index(index, INDEX_PATH)

def load_chunk_ids():
    if not os.path.exists(CHUNK_IDS_PATH):
        return []

    with open(CHUNK_IDS_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def save_chunk_ids(chunk_ids):
    os.makedirs(VECTOR_DIR, exist_ok=True)

    with open(CHUNK_IDS_PATH, "w", encoding="utf-8") as file:
        json.dump(chunk_ids, file)


def add_embeddings(chunk_ids: list[int], embeddings: list[list[float]]):
    index = load_index()
    existing_chunk_ids = load_chunk_ids()

    vectors = np.array(embeddings).astype("float32")

    index.add(vectors)
    existing_chunk_ids.extend(chunk_ids)

    save_index(index)
    save_chunk_ids(existing_chunk_ids)


def search_embedding(embedding: list[float], top_k: int = 5):
    index = load_index()
    chunk_ids = load_chunk_ids()

    if index.ntotal == 0:
        return []

    query_vector = np.array([embedding]).astype("float32")
    distances, indices = index.search(query_vector, top_k)

    results = []

    for distance, index_position in zip(distances[0], indices[0]):
        if index_position == -1:
            continue

        results.append({
            "chunk_id": chunk_ids[index_position],
            "distance": float(distance)
        })

    return results