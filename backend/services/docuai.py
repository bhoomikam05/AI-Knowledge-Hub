from langchain_groq import ChatGroq
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
import os
import shutil

# -------------------------------
# GLOBAL STATE
# -------------------------------
vectorstore = None
retriever = None
llm = None
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_llm():
    """Initialize LLM only when first needed."""
    global llm
    if llm is None:
        llm = ChatGroq(
            model="openai/gpt-oss-20b",
            temperature=0.7
        )
    return llm


def process_documents():
    """Load all documents from uploads folder and build vectorstore."""
    global retriever, vectorstore

    from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader, TextLoader

    print("Building vectorstore...")

    pdf_loader = DirectoryLoader(
        path=UPLOAD_DIR,
        glob="*.pdf",
        loader_cls=PyPDFLoader
    )
    txt_loader = DirectoryLoader(
        path=UPLOAD_DIR,
        glob="*.txt",
        loader_cls=TextLoader
    )

    pdf_docs = list(pdf_loader.lazy_load())
    txt_docs = list(txt_loader.lazy_load())
    docs = pdf_docs + txt_docs

    if not docs:
        retriever = None
        return {"status": "no_documents"}

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=30
    )
    chunks = splitter.split_documents(docs)

    embedding_model = FastEmbedEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
    )

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model
    )

    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 3, "lambda_mult": 0.7}
    )

    print(f"Vectorstore ready! {len(chunks)} chunks indexed.")
    return {"status": "ready", "chunks": len(chunks)}


def get_answer(query: str):
    """Answer a question using the uploaded documents."""
    global retriever

    if retriever is None:
        result = process_documents()
        if result["status"] == "no_documents":
            return {
                "answer": "No documents uploaded yet. Please upload a PDF or TXT file first.",
                "sources": []
            }

    model = get_llm()

    # Retrieve relevant chunks
    retrieved_docs = retriever.invoke(query)

    if not retrieved_docs:
        return {
            "answer": "I couldn't find relevant information in the uploaded documents.",
            "sources": []
        }

    # Format context and sources
    context = "\n".join([doc.page_content for doc in retrieved_docs])
    sources = list(set([
        os.path.basename(doc.metadata.get("source", "unknown"))
        for doc in retrieved_docs
    ]))

    # Relevance check
    eval_prompt = f"""
    Query: {query}
    Context: {context}
    Is this context relevant to answer the query? Reply YES or NO only.
    """
    evaluation = model.invoke(eval_prompt).content.strip().upper()

    # Query rewrite if not relevant
    if "NO" in evaluation:
        rewrite_prompt = f"Rewrite this query to improve document retrieval: '{query}'. Return only the rewritten query."
        query = model.invoke(rewrite_prompt).content.strip()
        retrieved_docs = retriever.invoke(query)
        context = "\n".join([doc.page_content for doc in retrieved_docs])
        sources = list(set([
            os.path.basename(doc.metadata.get("source", "unknown"))
            for doc in retrieved_docs
        ]))

    # Final answer
    final_prompt = f"""
    Answer the question using ONLY the context below.
    If the answer is not in the context, say "I don't have enough information to answer this."

    Context:
    {context}

    Question: {query}

    Give a clear, helpful answer.
    """

    answer = model.invoke(final_prompt).content

    return {
        "answer": answer,
        "sources": sources
    }


def get_uploaded_files():
    """Return list of uploaded files."""
    files = []
    for f in os.listdir(UPLOAD_DIR):
        if f.endswith((".pdf", ".txt")):
            files.append(f)
    return files


def delete_file(filename: str):
    """Delete a specific uploaded file and reset vectorstore."""
    global retriever, vectorstore
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        retriever = None
        vectorstore = None
        return {"status": "deleted"}
    return {"status": "not_found"}


def reset_vectorstore():
    """Reset the vectorstore (called after new upload)."""
    global retriever, vectorstore
    retriever = None
    vectorstore = None