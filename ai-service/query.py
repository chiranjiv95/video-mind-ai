import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_huggingface import ChatHuggingFace, HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate

load_dotenv()

def load_vector_store():
    # embeddings = GoogleGenerativeAIEmbeddings(
    #     model="gemini-embedding-001"
    # )

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings
    )

    return vectorstore

prompt_template = PromptTemplate(
    input_variables=["context", "question"],
    template="""
You are a helpful assistant.

Answer the question ONLY using the context below.

Context:
{context}

Question:
{question}
"""
)


def ask_question(question):
    vectorstore = load_vector_store()

    # 👉 Converts DB → search engine
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3}) # 👉 Get top 3 relevant chunks

    docs = retriever.invoke(question)

    # 👉 Combine chunks into one input for LLM
    context = "\n\n".join([doc.page_content for doc in docs])

    # llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview")

    llm = HuggingFaceEndpoint(
    repo_id="openai/gpt-oss-20b",
    task="text-generation",
    max_new_tokens=512
    )

    prompt = prompt_template.format(
    context = context,
    question = question
    )

    model = ChatHuggingFace(llm=llm)

    response = model.invoke(prompt)
    print('response', response)

    return response.content[0]["text"]


if __name__ == "__main__":
    question = "What is this video about?"

    answer = ask_question(question)

    print("\nAnswer:\n", answer)