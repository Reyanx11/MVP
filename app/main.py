from fastapi import FastAPI
from app.routes import auth_routes,documents_routes
from app.database import Base, engine
from app import models

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.include_router(auth_routes.router)
app.include_router(documents_routes.router)

@app.get("/")
def root():
    return {"status":"running"}

