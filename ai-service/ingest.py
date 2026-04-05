# Transcript → Documents → Split → Embeddings → Vector DB

import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_google_genai import GoogleGenerativeAIEmbeddings
# from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

load_dotenv()

def load_youtube_transcript(video_id):
    logger.info(f"Fetching transcript for video_id: {video_id}")
    fetched_transcript = YouTubeTranscriptApi().fetch(video_id)
    raw_transcript = fetched_transcript.to_raw_data()
    full_text = " ".join([t["text"].strip() for t in raw_transcript])
    return full_text

def create_documents(text):
    return [Document(page_content=text)]

def split_documents(documents):
    logger.info("Splitting documents into chunks...")
    text_splitter  = RecursiveCharacterTextSplitter(
        chunk_size= 1000,
        chunk_overlap=200
    )
    return text_splitter.split_documents(documents)

def create_vector_store(chunks):
    logger.info(f"Creating vector store with {len(chunks)} chunks...")
    embeddings = GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-001"
    )

    # embeddings = HuggingFaceEmbeddings(
    #     model_name="paraphrase-MiniLM-L3-v2"
    # )

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )

    return vectorstore


if __name__ == "__main__":
    video_id = "dQw4w9WgXcQ"

    text = load_youtube_transcript(video_id)
    docs = create_documents(text)
    print("Docs", docs)

    chunks = split_documents(docs)
    vectorstore = create_vector_store(chunks)

    print("Vector store created successfully ✅")
    
    print("Number of chunks:", len(chunks))
    print("\nFirst chunk:\n", chunks[0].page_content[:300])