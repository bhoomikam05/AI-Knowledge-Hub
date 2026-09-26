import chromadb
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
        vectorstore = None
        retriever = None
        return {"status": "no_documents"}

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )
    chunks = splitter.split_documents(docs)

    # Ensure source metadata contains normalized basename for reliable filtering
    for chunk in chunks:
        if "source" in chunk.metadata:
            chunk.metadata["source"] = os.path.basename(chunk.metadata["source"])

    embedding_model = FastEmbedEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
    )

    # Use fresh ephemeral client and delete any existing collection to prevent stale vector pollution
    chroma_client = chromadb.EphemeralClient()
    try:
        chroma_client.delete_collection("docuai_documents")
    except Exception:
        pass

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        client=chroma_client,
        collection_name="docuai_documents"
    )

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 8}
    )

    print(f"Vectorstore ready! {len(chunks)} chunks indexed.")
    return {"status": "ready", "chunks": len(chunks)}


def get_answer(query: str, filename: str = None):
    """Answer a question using uploaded document(s)."""
    global retriever, vectorstore

    if retriever is None or vectorstore is None:
        result = process_documents()
        if result["status"] == "no_documents":
            return {
                "answer": "No documents uploaded yet. Please upload a PDF or TXT file first.",
                "sources": []
            }

    model = get_llm()

    # Retrieve relevant chunks across documents (filtered by filename only if explicitly provided)
    if filename and filename.strip():
        target_file = os.path.basename(filename.strip())
        all_matches = vectorstore.similarity_search(query, k=30)
        retrieved_docs = [
            doc for doc in all_matches
            if os.path.basename(doc.metadata.get("source", "")) == target_file or os.path.basename(doc.metadata.get("filename", "")) == target_file
        ][:8]
    else:
        # Balanced multi-document search: ensure every uploaded file contributes top relevant chunks
        unique_files = list(set([
            os.path.basename(meta.get("source", ""))
            for meta in vectorstore.get().get("metadatas", [])
            if meta and meta.get("source")
        ]))

        if len(unique_files) > 1:
            retrieved_docs = []
            for u_file in unique_files:
                matches = vectorstore.similarity_search(
                    query,
                    k=4,
                    filter={"source": u_file}
                )
                retrieved_docs.extend(matches)
        else:
            retrieved_docs = vectorstore.similarity_search(query, k=8)

    if not retrieved_docs:
        return {
            "answer": "I couldn't find relevant information in the uploaded documents.",
            "sources": []
        }

    # Format context with explicit document tags
    context_blocks = []
    candidate_sources = []
    for doc in retrieved_docs:
        src = doc.metadata.get("source") or doc.metadata.get("filename")
        if src:
            src_base = os.path.basename(src)
            if src_base not in candidate_sources:
                candidate_sources.append(src_base)
            context_blocks.append(f"[Document: {src_base}]\n{doc.page_content.strip()}")
        else:
            context_blocks.append(doc.page_content.strip())

    context = "\n\n".join(context_blocks)

    # Final answer prompt requiring exact source attribution
    final_prompt = f"""You are an AI document assistant. Answer the user's question using ONLY the Document Context provided below.

Document Context:
{context}

User Question: {query}

CRITICAL RULES:
1. If the Document Context does NOT contain enough information to answer the question, clearly state: "I couldn't find relevant information in the uploaded documents." and write "SOURCES_USED: None".
2. Answer concisely and accurately based ONLY on the provided Document Context.
3. Identify which specific document filename(s) from the tags [Document: filename.ext] actually provided the facts used in your answer.
4. At the very end of your response, on a new line, output EXACTLY:
   SOURCES_USED: filename1.ext, filename2.ext
   (or "SOURCES_USED: None" if no information was found).
5. Do NOT list a filename if its content was not actually used in formulating your answer.

Format:
<your detailed answer>

SOURCES_USED: <filename(s) or None>"""

    raw_response = model.invoke(final_prompt).content.strip()

    final_answer = raw_response
    used_sources = []

    if "SOURCES_USED:" in raw_response:
        parts = raw_response.rsplit("SOURCES_USED:", 1)
        final_answer = parts[0].strip()
        sources_str = parts[1].strip()

        if sources_str.lower() != "none" and not sources_str.lower().startswith("none"):
            raw_sources = [s.strip() for s in sources_str.split(",") if s.strip()]
            for s in raw_sources:
                clean_name = os.path.basename(s)
                # Match against candidate_sources from similarity search
                matched = next((c for c in candidate_sources if c.lower() == clean_name.lower()), None)
                if matched and matched not in used_sources:
                    used_sources.append(matched)

    # Fallback to candidate_sources if SOURCES_USED tag was omitted by LLM but answer is valid
    answer_lower = final_answer.lower()
    if "couldn't find relevant information" in answer_lower or "not found in the uploaded documents" in answer_lower or "don't have enough information" in answer_lower:
        used_sources = []
    elif not used_sources and candidate_sources:
        # Fallback: if LLM didn't format SOURCES_USED tag, match candidate filenames mentioned in text or fallback safely
        for cand in candidate_sources:
            if cand.lower() in raw_response.lower():
                used_sources.append(cand)
        if not used_sources and len(candidate_sources) == 1:
            used_sources = candidate_sources

    return {
        "answer": final_answer,
        "sources": used_sources
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