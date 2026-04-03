from fastapi import FastAPI
from pydantic import BaseModel

from ingest import load_youtube_transcript, create_documents, split_documents, create_vector_store
from query import ask_question

class IngestRequest(BaseModel):
    video_id: str

class ChatRequest(BaseModel):
    question: str

app = FastAPI()

@app.get("/")
def root():
    return {"message": "AI Service running 🚀"}

@app.post("/ingest")
def ingest(req: IngestRequest):
    try:
        text = load_youtube_transcript(req.video_id)
        docs = create_documents(text)
        chunks = split_documents(docs)

        create_vector_store(chunks)

        return {
            "message": "Video ingested successfully",
            "chunks": len(chunks)
        }

    except Exception as e:
        return {"error": str(e)}
        

@app.post("/chat")
def chat(req: ChatRequest):
    try:
        answer = ask_question(req.question)

        return {
            "question": req.question,
            "answer": answer
        }

    except Exception as e:
        return {"error": str(e)}