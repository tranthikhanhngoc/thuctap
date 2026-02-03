from fastapi import FastAPI
from init_db import init_db
from database import Base, engine
from routers.users import router as user_router

app = FastAPI()
init_db ()

app.include_router(user_router)

@app.get("/")
def root():
    return {"message": "FastAPI backend running!"}
