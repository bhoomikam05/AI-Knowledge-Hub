import os
import re
import tempfile
import logging
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from langchain_groq import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings

import subprocess
import shutil
import chromadb
import yt_dlp
from groq import Groq
try:
    import static_ffmpeg
except ImportError:
    static_ffmpeg = None

# Configure logger
logger = logging.getLogger("videomind")
logging.basicConfig(level=logging.INFO)

# Global state isolated per video_id
video_stores = {}  # { video_id: { "retriever": ..., "word_count": ..., "chunks": ... } }
current_video_id = None
video_llm = None


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


def split_audio_file(input_path: str) -> list[str]:
    """
    Split a large audio file into ~10 minute segment files using FFmpeg stream copy.
    Raises RuntimeError if FFmpeg is not available in the system environment.
    """
    if static_ffmpeg:
        try:
            static_ffmpeg.add_paths()
        except Exception as e:
            logger.warning(f"Failed to add static_ffmpeg paths: {e}")

    ffmpeg_bin = shutil.which("ffmpeg")
    if not ffmpeg_bin:
        raise RuntimeError(
            "FFmpeg is required to process long audio files (>25MB) without captions, "
            "but FFmpeg is not installed in the current environment."
        )

    base_name, ext = os.path.splitext(input_path)
    output_pattern = f"{base_name}_chunk_%03d{ext}"
    dir_name = os.path.dirname(input_path) or "."
    prefix = os.path.basename(base_name) + "_chunk_"

    # Segment audio file into 10-minute chunks (600s) using stream copy (-c copy)
    cmd = [
        ffmpeg_bin, "-y", "-i", input_path,
        "-f", "segment", "-segment_time", "600",
        "-c", "copy", output_pattern
    ]

    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        if res.returncode != 0:
            err_msg = res.stderr.decode("utf-8", errors="ignore").strip()
            raise RuntimeError(f"FFmpeg segmentation failed: {err_msg[:200]}")

        created = sorted([
            os.path.join(dir_name, f) for f in os.listdir(dir_name)
            if f.startswith(prefix) and f.endswith(ext)
        ])
        if not created:
            raise RuntimeError("FFmpeg segmentation produced no output chunk files.")

        return created
    except Exception as e:
        if isinstance(e, RuntimeError):
            raise
        raise RuntimeError(f"FFmpeg audio splitting failed: {e}")


def transcribe_audio_fallback(url: str) -> str:
    """Fallback: Download audio using yt-dlp and transcribe using Groq Speech-to-Text API."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not configured.")

    temp_dir = tempfile.gettempdir()
    output_base = os.path.join(temp_dir, f"videomind_{os.getpid()}_{abs(hash(url))}")
    output_template = f"{output_base}.%(ext)s"

    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        'outtmpl': output_template,
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        'max_filesize': 250 * 1024 * 1024,
    }

    files_to_clean = []
    try:
        logger.info(f"Downloading audio stream for {url} via yt-dlp...")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            if os.path.exists(filename):
                downloaded_file = filename
            else:
                base = filename.rsplit('.', 1)[0]
                downloaded_file = None
                for ext in ['m4a', 'mp3', 'webm', 'mp4', 'ogg', 'wav', 'aac']:
                    candidate = f"{base}.{ext}"
                    if os.path.exists(candidate):
                        downloaded_file = candidate
                        break

        if not downloaded_file or not os.path.exists(downloaded_file):
            raise RuntimeError("Audio stream could not be downloaded.")

        files_to_clean.append(downloaded_file)
        file_size = os.path.getsize(downloaded_file)
        logger.info(f"Downloaded audio stream size: {file_size} bytes")

        GROQ_MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB Groq API limit

        if file_size > GROQ_MAX_FILE_SIZE:
            logger.info(f"Audio file size ({file_size} bytes) exceeds 25MB limit; splitting into smaller chunks via FFmpeg...")
            chunk_files = split_audio_file(downloaded_file)
            files_to_clean.extend(chunk_files)
        else:
            chunk_files = [downloaded_file]

        logger.info(f"Transcribing {len(chunk_files)} audio chunk(s) via Groq STT API...")
        client = Groq(api_key=api_key)
        transcriptions = []

        for idx, chunk_file in enumerate(chunk_files):
            chunk_size = os.path.getsize(chunk_file)
            logger.info(f"Transcribing chunk {idx + 1}/{len(chunk_files)} ({chunk_size} bytes)...")
            if chunk_size > GROQ_MAX_FILE_SIZE:
                raise ValueError(f"Audio chunk {idx + 1} ({chunk_size} bytes) still exceeds 25MB Groq API limit.")

            with open(chunk_file, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    file=(os.path.basename(chunk_file), audio_file.read()),
                    model="whisper-large-v3-turbo",
                    response_format="json"
                )
                if transcription and hasattr(transcription, "text") and transcription.text:
                    transcriptions.append(transcription.text.strip())

        full_transcript = " ".join([t for t in transcriptions if t])
        return full_transcript

    finally:
        # Guarantee cleanup of all temporary audio main files and chunk files
        for fpath in set(files_to_clean):
            if fpath and os.path.exists(fpath):
                try:
                    os.remove(fpath)
                    logger.info(f"Cleaned up temp file {fpath}")
                except Exception as cleanup_err:
                    logger.warning(f"Error removing temp audio file {fpath}: {cleanup_err}")


def process_video(url: str):
    """Extract transcript and build vectorstore for a YouTube video."""
    global current_video_id, video_stores

    video_id = extract_video_id(url)
    if not video_id:
        return {"status": "error", "message": "Invalid YouTube URL. Please check the URL and try again."}

    # If already processed, return stored word and chunk count
    if video_id == current_video_id and video_id in video_stores:
        store = video_stores[video_id]
        return {
            "status": "already_processed",
            "video_id": video_id,
            "word_count": store.get("word_count", 0),
            "chunks": store.get("chunks", 0)
        }

    transcript_text = ""

    # ATTEMPT 1: YouTube Captions / Transcript API
    try:
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        except AttributeError:
            api = YouTubeTranscriptApi()
            transcript_list = api.fetch(video_id)

        if transcript_list:
            if isinstance(transcript_list[0], dict):
                transcript_text = " ".join([entry.get("text", "") for entry in transcript_list])
            else:
                transcript_text = " ".join([getattr(entry, "text", str(entry)) for entry in transcript_list])
        logger.info(f"Successfully fetched transcript via YouTubeTranscriptApi for video_id: {video_id}")
    except (TranscriptsDisabled, NoTranscriptFound) as e:
        logger.info(f"YouTube captions unavailable for {video_id} ({type(e).__name__}). Trying speech-to-text fallback...")
    except Exception as e:
        logger.warning(f"YouTube transcript fetch failed for {video_id}: {e}. Trying speech-to-text fallback...")

    # ATTEMPT 2: Fallback to Speech-to-Text via yt-dlp + Groq STT
    if not transcript_text or not transcript_text.strip():
        try:
            transcript_text = transcribe_audio_fallback(url)
            logger.info(f"Successfully transcribed audio via speech-to-text fallback for video_id: {video_id}")
        except Exception as fallback_err:
            logger.error(f"Speech-to-text fallback failed for video {url}: {fallback_err}")
            current_video_id = None
            msg = str(fallback_err) if isinstance(fallback_err, (RuntimeError, ValueError)) else "Could not retrieve transcript or transcribe audio for this video. Please ensure the video is public and accessible."
            return {
                "status": "error",
                "message": msg
            }

    if not transcript_text or not transcript_text.strip():
        current_video_id = None
        return {"status": "error", "message": "No usable speech or transcript content found in this video."}

    # Split transcript into rich, coherent chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.create_documents([transcript_text])

    if not chunks:
        current_video_id = None
        return {"status": "error", "message": "No usable transcript chunks generated for this video."}

    # Build vectorstore with fresh EphemeralClient and unique collection per video_id
    embedding_model = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    chroma_client = chromadb.EphemeralClient()
    collection_name = f"videomind_{video_id}"
    video_vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        client=chroma_client,
        collection_name=collection_name
    )
    video_retriever = video_vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 6}
    )

    word_count = len(transcript_text.split())

    # Save to isolated video_stores map and update current_video_id
    video_stores[video_id] = {
        "retriever": video_retriever,
        "word_count": word_count,
        "chunks": len(chunks)
    }
    current_video_id = video_id

    return {
        "status": "ready",
        "video_id": video_id,
        "word_count": word_count,
        "chunks": len(chunks)
    }


def get_summary():
    """Generate a summary of the current video."""
    global current_video_id, video_stores

    if not current_video_id or current_video_id not in video_stores:
        return {"answer": "No valid video transcript processed. Please process a public YouTube video first.", "sources": []}

    store = video_stores[current_video_id]
    retriever = store.get("retriever")
    if not retriever or store.get("chunks", 0) == 0:
        return {"answer": "No usable transcript content available for this video.", "sources": []}

    model = get_llm()
    docs = retriever.invoke("main topic summary key points")
    if not docs:
        return {"answer": "No transcript content available for this video.", "sources": []}

    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""
    Based on this transcript excerpt, provide a clear and concise summary of the video.
    Include: main topic, key points, and important takeaways.

    Transcript Excerpt:
    {context}

    Write a well-structured summary in 3-4 paragraphs.
    """
    answer = model.invoke(prompt).content.strip()
    return {"answer": answer, "sources": ["Video Transcript"]}


def ask_video_question(query: str):
    """Answer a question about the current video."""
    global current_video_id, video_stores

    if not current_video_id or current_video_id not in video_stores:
        return {"answer": "No valid video transcript processed. Please process a public YouTube video first.", "sources": []}

    store = video_stores[current_video_id]
    retriever = store.get("retriever")
    if not retriever or store.get("chunks", 0) == 0:
        return {"answer": "This topic wasn't covered in the video.", "sources": ["Video Transcript"]}

    model = get_llm()
    docs = retriever.invoke(query)
    if not docs:
        return {"answer": "This topic wasn't covered in the video.", "sources": ["Video Transcript"]}

    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""You are an AI assistant analyzing a YouTube video transcript to answer a user's question.

Transcript Excerpt:
{context}

User Question: {query}

Instructions:
- Answer the question clearly, thoroughly, and accurately using ONLY the information provided in the transcript excerpt above.
- You may use conceptual understanding, semantic reasoning, and paraphrasing of the transcript content to answer.
- Do NOT use outside knowledge or hallucinate facts that are not present or implied in the transcript.
- ONLY if the transcript excerpt genuinely does not contain enough information or relevance to answer the question, reply with EXACTLY: "This topic wasn't covered in the video."
"""
    answer = model.invoke(prompt).content.strip()
    return {"answer": answer, "sources": ["Video Transcript"]}