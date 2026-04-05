from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger(__name__)

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
    logger.info(f"Received ingest request for video_id: {req.video_id}")
    try:
        text = load_youtube_transcript(req.video_id)
        logger.info(f"Successfully loaded transcript for {req.video_id}")
        docs = create_documents(text)
        chunks = split_documents(docs)

        create_vector_store(chunks)
        logger.info(f"Successfully processed and stored chunks for video {req.video_id}")

        return {
            "message": "Video ingested successfully",
            "chunks": len(chunks)
        }

    except Exception as e:
        logger.error(f"Error ingesting video {req.video_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
        

@app.post("/chat")
def chat(req: ChatRequest):
    logger.info(f"Received chat request. Question length: {len(req.question)}")
    try:
        answer = ask_question(req.question)
        logger.info("Successfully generated answer.")

        return {
            "question": req.question,
            "answer": answer
        }

    except Exception as e:
        logger.error(f"Error during chat: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Answer generation failed: {str(e)}")