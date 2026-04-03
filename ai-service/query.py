import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

def load_vector_store():
    embeddings = GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-001"
    )

    vectorstore = Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings
    )

    return vectorstore


def ask_question(question):
    vectorstore = load_vector_store()

    # 👉 Converts DB → search engine
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3}) # 👉 Get top 3 relevant chunks

    docs = retriever.invoke(question)

    # 👉 Combine chunks into one input for LLM
    context = "\n\n".join([doc.page_content for doc in docs])

    llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview")

    prompt = f"""
    Answer the question based only on the context below.

    Context:
    {context}

    Question:
    {question}
    """

    response = llm.invoke(prompt)

    return response.content


if __name__ == "__main__":
    question = "What is this video about?"

    answer = ask_question(question)

    print("\nAnswer:\n", answer)