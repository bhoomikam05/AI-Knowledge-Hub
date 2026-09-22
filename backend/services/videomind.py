from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from langchain_groq import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
import re
# from django.contrib.messages import api

# Global state
video_vectorstore = None
video_retriever = None
video_llm = None
current_video_id = None


def get_llm():
    global video_llm
    if video_llm is None:
        video_llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0.7)
    return video_llm


def extract_video_id(url: str):
    """Extract YouTube video ID from URL."""
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def process_video(url: str):
    """Extract transcript and build vectorstore for a YouTube video."""
    global video_vectorstore, video_retriever, current_video_id

    video_id = extract_video_id(url)
    if not video_id:
        return {"status": "error", "message": "Invalid YouTube URL. Please check the URL and try again."}

    # Don't reprocess same video
    if video_id == current_video_id and video_retriever is not None:
        return {"status": "already_processed", "video_id": video_id}

    try:
        # transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        api = YouTubeTranscriptApi()
        transcript_list = api.fetch(video_id)
        transcript_text = " ".join([entry.text for entry in transcript_list])
    except TranscriptsDisabled:
        return {"status": "error", "message": "This video has disabled transcripts/captions."}
    except NoTranscriptFound:
        return {"status": "error", "message": "No transcript found for this video. Try a video with captions enabled."}
    except Exception as e:
        return {"status": "error", "message": f"Could not fetch transcript: {str(e)}"}

    # Split transcript into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.create_documents([transcript_text])

    # Build vectorstore
    embedding_model = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    video_vectorstore = Chroma.from_documents(documents=chunks, embedding=embedding_model)
    video_retriever = video_vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 4, "lambda_mult": 0.7}
    )

    current_video_id = video_id
    word_count = len(transcript_text.split())

    return {
        "status": "ready",
        "video_id": video_id,
        "word_count": word_count,
        "chunks": len(chunks)
    }


def get_summary():
    """Generate a summary of the video."""
    global video_retriever
    if video_retriever is None:
        return {"answer": "Please process a video first.", "sources": []}

    model = get_llm()
    docs = video_retriever.invoke("main topic summary key points")
    context = "\n".join([doc.page_content for doc in docs])

    prompt = f"""
    Based on this transcript excerpt, provide a clear and concise summary of the video.
    Include: main topic, key points, and important takeaways.

    Transcript:
    {context}

    Write a well-structured summary in 3-4 paragraphs.
    """
    answer = model.invoke(prompt).content
    return {"answer": answer, "sources": ["Video Transcript"]}


def ask_video_question(query: str):
    """Answer a question about the video."""
    global video_retriever
    if video_retriever is None:
        return {"answer": "Please process a video first.", "sources": []}

    model = get_llm()
    docs = video_retriever.invoke(query)
    context = "\n".join([doc.page_content for doc in docs])

    prompt = f"""
    Answer the question using ONLY the video transcript below.
    If the answer is not in the transcript, say "This topic wasn't covered in the video."

    Transcript excerpt:
    {context}

    Question: {query}

    Give a clear, helpful answer.
    """
    answer = model.invoke(prompt).content
    return {"answer": answer, "sources": ["Video Transcript"]}