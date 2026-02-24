from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from init_db import init_db
from routers.users import router as user_router
from routers.doctors import router as doctor_router


app = FastAPI()

#  CORS (QUAN TRỌNG)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # dev cho phép tất cả
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(user_router)
app.include_router(doctor_router)

@app.get("/")
def root():
    return {"message": "FastAPI backend running!"}
