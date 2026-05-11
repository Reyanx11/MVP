from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal
from app.models import DocumentChunk
from app.services.embeddings import embed_texts
from app.services.vector_store import VECTOR_DIR, add_embeddings


def main() -> None:
    vector_dir = Path(VECTOR_DIR)
    vector_dir.mkdir(parents=True, exist_ok=True)
    for file_path in vector_dir.glob("*"):
        if file_path.is_file():
            file_path.unlink()

    db = SessionLocal()
    try:
        chunks = db.query(DocumentChunk).order_by(DocumentChunk.id).all()
        print(f"chunks to index: {len(chunks)}")

        batch_size = 32
        for start in range(0, len(chunks), batch_size):
            batch = chunks[start : start + batch_size]
            chunk_ids = [chunk.id for chunk in batch]
            texts = [chunk.content for chunk in batch]
            add_embeddings(chunk_ids, embed_texts(texts))
            print(f"indexed: {start + len(batch)}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
