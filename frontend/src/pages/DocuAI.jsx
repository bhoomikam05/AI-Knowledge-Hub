import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Send, FileText, Loader2 } from 'lucide-react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const renderInlineText = (str) => {
  if (!str) return null
  const cleanStr = str.replace(/^-{3,}$/g, '').trim()
  if (!cleanStr) return null

  const parts = cleanStr.split(/(\*\*[^\*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

const formatMessageContent = (text) => {
  if (!text) return null

  const blocks = text.split(/\n\n+/)

  return blocks.map((block, pIdx) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return null

    // Table rendering
    const tableLines = lines.filter(l => l.startsWith('|') && l.endsWith('|'))
    if (tableLines.length >= 2) {
      const headerRow = tableLines[0].split('|').map(c => c.trim()).filter(Boolean)
      const dataRows = tableLines.slice(1)
        .filter(l => !l.includes('---'))
        .map(l => l.split('|').map(c => c.trim()).filter(Boolean))

      return (
        <div key={pIdx} className="my-3 overflow-x-auto rounded-xl border border-[#2e2e3e] bg-[#141420]">
          <table className="w-full text-xs text-gray-200 border-collapse">
            <thead>
              <tr className="bg-[#1e1e2e] border-b border-[#2e2e3e]">
                {headerRow.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold text-blue-300">
                    {h.replace(/\*\*/g, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-[#2e2e3e]/50 last:border-0 hover:bg-[#1b1b2a]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-gray-300">
                      {renderInlineText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Headings
    const firstLine = lines[0]
    const headingMatch = firstLine.match(/^(?:\#{1,4}\s*|\*{2})([^\*]+)(?:\*{2})?$/)
    if (headingMatch && lines.length === 1 && !firstLine.includes(':')) {
      const headingText = headingMatch[1].trim()
      return (
        <h3 key={pIdx} className="text-sm font-bold text-blue-300 mt-4 mb-2 uppercase tracking-wider">
          {headingText}
        </h3>
      )
    }

    // Lists
    const isList = lines.every(l => /^[\*\-•]\s|^\d+[\.\)]\s/.test(l))
    if (isList) {
      return (
        <ul key={pIdx} className="space-y-1.5 my-2">
          {lines.map((l, lIdx) => {
            const cleanLine = l.replace(/^[\*\-•]\s*|^\d+[\.\)]\s*/, '')
            return (
              <li key={lIdx} className="flex items-start gap-2 text-sm text-gray-200">
                <span className="text-blue-400 font-bold mt-0.5 text-xs shrink-0">•</span>
                <span className="flex-1">{renderInlineText(cleanLine)}</span>
              </li>
            )
          })}
        </ul>
      )
    }

    // Paragraph
    return (
      <div key={pIdx} className="my-2 space-y-1 text-sm text-gray-200 leading-relaxed">
        {lines.map((line, lIdx) => {
          if (/^[\*\-•]\s|^\d+[\.\)]\s/.test(line)) {
            const clean = line.replace(/^[\*\-•]\s*|^\d+[\.\)]\s*/, '')
            return (
              <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                <span className="text-blue-400 font-bold mt-0.5 text-xs shrink-0">•</span>
                <span className="flex-1">{renderInlineText(clean)}</span>
              </div>
            )
          }

          const boldTitleMatch = line.match(/^(\*{2}[^\*]+\*{2}\:?)\s*(.*)/)
          if (boldTitleMatch) {
            const titleStr = boldTitleMatch[1].replace(/\*\*/g, '').replace(/:$/, '').trim()
            const restStr = boldTitleMatch[2]
            return (
              <div key={lIdx} className="mt-3 mb-1">
                <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">
                  {titleStr}
                </p>
                {restStr && <p className="text-sm text-gray-200">{renderInlineText(restStr)}</p>}
              </div>
            )
          }

          return <p key={lIdx}>{renderInlineText(line)}</p>
        })}
      </div>
    )
  })
}

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

  // Auto scroll to bottom of chat when messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API}/docuai/files`)
      const fileList = res.data.files || []
      setFiles(fileList)
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

  const handleDelete = async (filename, e) => {
    if (e) e.stopPropagation()
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
      const res = await axios.post(`${API}/docuai/ask`, {
        question: userQuestion
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources
      }])

      // Save to history
      const historyItem = {
        type: 'document',
        title: 'Uploaded Documents',
        time: new Date().toLocaleString(),
        question: userQuestion,
        answer: res.data.answer,
        detail: res.data.sources && res.data.sources.length > 0 ? `Sources: ${res.data.sources.join(', ')}` : 'Uploaded documents'
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
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                Uploaded Files ({files.length})
              </p>
            </div>
            {files.length === 0 ? (
              <p className="text-gray-600 text-sm text-center mt-4">No files uploaded yet</p>
            ) : (
              files.map((file) => (
                <div
                  key={file}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[#111118] border border-[#1e1e2e] text-gray-300"
                >
                  <FileText className="shrink-0 text-blue-400" size={14} />
                  <span className="text-xs truncate flex-1">{file}</span>
                  <button
                    onClick={(e) => handleDelete(file, e)}
                    className="text-gray-600 hover:text-red-400 transition-colors shrink-0 p-0.5"
                    title="Delete document"
                  >
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
                <p className="text-gray-600 text-sm mt-2">Upload PDF or TXT files and start chatting</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#111118] border border-[#1e1e2e] text-gray-200'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      formatMessageContent(msg.content)
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#2e2e3e]">
                        <p className="text-xs text-blue-400 font-medium">
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
                  <span className="text-gray-400 text-sm font-medium">Searching documents & thinking...</span>
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