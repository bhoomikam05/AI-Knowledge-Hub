import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Send, FileText, Loader2 } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

export default function DocuAI() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)

  // Load files on page load
  useEffect(() => {
    fetchFiles()
  }, [])

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API}/docuai/files`)
      setFiles(res.data.files)
    } catch (err) {
      console.error('Error fetching files:', err)
    }
  }

  const handleUpload = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return
    setUploading(true)

    for (const file of selectedFiles) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        await axios.post(`${API}/docuai/upload`, formData)
      } catch (err) {
        console.error('Upload error:', err)
      }
    }

    await fetchFiles()
    setUploading(false)
  }

  const handleDelete = async (filename) => {
    try {
      await axios.delete(`${API}/docuai/files/${filename}`)
      await fetchFiles()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

const handleAsk = async () => {
  if (!question.trim()) return
  const userQuestion = question
  setQuestion('')
  setMessages(prev => [...prev, { role: 'user', content: userQuestion }])
  setLoading(true)

  try {
    const res = await axios.post(`${API}/docuai/ask`, { question: userQuestion })
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: res.data.answer,
      sources: res.data.sources
    }])

    // Save to history
    const historyItem = {
      type: 'document',
      title: files[0] || 'Document',
      time: new Date().toLocaleString(),
      question: userQuestion,
      answer: res.data.answer,
      detail: `Answer from ${res.data.sources?.join(', ') || 'uploaded document'}`
    }
    const existing = JSON.parse(localStorage.getItem('ai_hub_history') || '[]')
    localStorage.setItem('ai_hub_history', JSON.stringify([historyItem, ...existing]))

  } catch (err) {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Sorry, something went wrong. Please try again.',
      sources: []
    }])
  }
  setLoading(false)
}

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">

      {/* Header */}
      <div className="border-b border-[#1e1e2e] px-6 py-4 flex items-center gap-4">
        {/* <button onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button> */}
        <div className="flex items-center gap-2">
          <FileText className="text-blue-400" size={20} />
          <h1 className="text-white font-bold text-lg">DocuAI</h1>
        </div>
        <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
          Document Intelligence
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left Panel — Upload */}
        <div className="w-80 border-r border-[#1e1e2e] flex flex-col p-4 gap-4">

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver ? 'border-blue-400 bg-blue-400/5' : 'border-[#1e1e2e] hover:border-blue-400/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleUpload(e.dataTransfer.files)
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="text-blue-400 animate-spin" size={28} />
                <p className="text-gray-400 text-sm">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="text-blue-400" size={28} />
                <p className="text-white text-sm font-medium">Drop files here</p>
                <p className="text-gray-500 text-xs">PDF or TXT files supported</p>
              </div>
            )}
          </div>

          {/* File List */}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              Uploaded Files ({files.length})
            </p>
            {files.length === 0 ? (
              <p className="text-gray-600 text-sm text-center mt-4">No files uploaded yet</p>
            ) : (
              files.map((file) => (
                <div key={file}
                  className="flex items-center gap-2 bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-2">
                  <FileText className="text-blue-400 shrink-0" size={14} />
                  <span className="text-gray-300 text-xs truncate flex-1">{file}</span>
                  <button onClick={() => handleDelete(file)}
                    className="text-gray-600 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Chat */}
        <div className="flex-1 flex flex-col">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <FileText className="text-blue-400/30 mb-4" size={48} />
                <p className="text-gray-400 text-lg font-medium">Ask anything about your documents</p>
                <p className="text-gray-600 text-sm mt-2">Upload a PDF or TXT file and start chatting</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#111118] border border-[#1e1e2e] text-gray-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#2e2e3e]">
                        <p className="text-xs text-gray-500">
                          Sources: {msg.sources.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="text-blue-400 animate-spin" size={16} />
                  <span className="text-gray-400 text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#1e1e2e] p-4">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask a question about your documents..."
                className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm"
              />
              <button
                onClick={handleAsk}
                disabled={!question.trim() || loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all">
                <Send size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}