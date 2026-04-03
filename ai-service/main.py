from fastapi import FastAPI
from pydantic import BaseModel

from query import ask_question

class ChatRequest(BaseModel):
    question: str

app = FastAPI()

@app.get("/")
def root():
    return {"message": "AI Service running 🚀"}

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