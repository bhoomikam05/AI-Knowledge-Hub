from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
import os
import shutil

load_dotenv()

app = FastAPI(title="AI Knowledge Hub API")

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")

if allowed_origins_env:
    origins = [
        origin.strip()
        for origin in allowed_origins_env.split(",")
        if origin.strip()
    ]
else:
    origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ─── Models ───────────────────────────────────────────────
class QuestionRequest(BaseModel):
    question: str


# ─── Basic Routes ─────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "AI Knowledge Hub API is running!"}

@app.get("/ping")
def ping():
    return {"status": "ok"}


# ─── DocuAI Routes ────────────────────────────────────────
@app.post("/docuai/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a PDF or TXT file."""
    if not file.filename.endswith((".pdf", ".txt")):
        return {"error": "Only PDF and TXT files are supported."}

    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Reset vectorstore so it rebuilds with new file
    from services.docuai import reset_vectorstore
    reset_vectorstore()

    return {"status": "uploaded", "filename": file.filename}


@app.get("/docuai/files")
def get_files():
    """Get list of uploaded files."""
    from services.docuai import get_uploaded_files
    return {"files": get_uploaded_files()}


@app.delete("/docuai/files/{filename}")
def delete_file(filename: str):
    """Delete an uploaded file."""
    from services.docuai import delete_file as _delete
    return _delete(filename)


@app.post("/docuai/ask")
def ask_question(request: QuestionRequest):
    """Ask a question about uploaded documents."""
    from services.docuai import get_answer
    return get_answer(request.question)

# ─── VideoMind Routes ─────────────────────────────────────
class VideoRequest(BaseModel):
    url: str

class VideoQuestion(BaseModel):
    question: str

@app.post("/videomind/process")
def process_video(request: VideoRequest):
    """Process a YouTube video URL."""
    from services.videomind import process_video as _process
    return _process(request.url)

@app.get("/videomind/summary")
def get_video_summary():
    """Get summary of processed video."""
    from services.videomind import get_summary
    return get_summary()

@app.post("/videomind/ask")
def ask_video(request: VideoQuestion):
    """Ask a question about the video."""
    from services.videomind import ask_video_question
    return ask_video_question(request.question)