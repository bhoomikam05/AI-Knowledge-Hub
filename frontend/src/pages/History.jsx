import { FileText, Video, Clock, ChevronDown, ChevronUp, Download, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function History() {
  const [history, setHistory] = useState([])
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ai_hub_history') || '[]')
    setHistory(saved)
  }, [])

  const filtered = history.filter(item => {
    if (filter === 'All') return true
    if (filter === 'Documents') return item.type === 'document'
    if (filter === 'Videos') return item.type === 'video'
    return true
  })

  const toggleExpand = (i) => {
    setExpanded(prev => ({ ...prev, [i]: !prev[i] }))
  }

  const downloadHistory = () => {
    const content = filtered.map((item, i) =>
      `[${i + 1}] ${item.type.toUpperCase()} — ${item.title}
Time: ${item.time}
Question: ${item.question}
Answer: ${item.answer || 'N/A'}
${'─'.repeat(60)}`
    ).join('\n\n')

    const blob = new Blob([`AI KNOWLEDGE HUB — ACTIVITY HISTORY\n${'═'.repeat(60)}\n\n${content}`],
      { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai_knowledge_hub_history.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Workspace Activity</p>
            <h1 className="text-3xl font-bold text-white mb-2">Activity History</h1>
            <p className="text-gray-500">Your recent questions and analyzed videos.</p>
          </div>
{filtered.length > 0 && (
  <div className="flex gap-2">
    <button
      onClick={downloadHistory}
      className="flex items-center gap-2 px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e3e] border border-[#2e2e3e] text-gray-300 rounded-xl text-sm font-medium transition-all"
    >
      <Download size={15} />
      Download History
    </button>
    <button
      onClick={() => {
        if (window.confirm('Are you sure you want to clear all history?')) {
          localStorage.removeItem('ai_hub_history')
          setHistory([])
        }
      }}
      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all"
    >
      <Clock size={15} />
      Clear History
    </button>
  </div>
)}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['All', 'Documents', 'Videos'].map((tab) => (
            <button key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === tab
                  ? 'bg-[#1e1e2e] text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* History Items */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="text-gray-700 mx-auto mb-4" size={40} />
            <p className="text-gray-500 text-lg font-medium">No activity yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Start by uploading a document in DocuAI or processing a video in VideoMind.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item, i) => (
              <div key={i}
                className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl overflow-hidden hover:border-[#2e2e3e] transition-all">

                {/* Header Row */}
                <div
                  className="p-4 flex items-start gap-4 cursor-pointer"
                  onClick={() => toggleExpand(i)}
                >
                  <div className="w-9 h-9 rounded-lg bg-[#1e1e2e] flex items-center justify-center shrink-0">
                    {item.type === 'document'
                      ? <FileText className="text-blue-400" size={16} />
                      : <Video className="text-purple-400" size={16} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      <span className="text-gray-600 text-xs shrink-0">· {item.time}</span>
                    </div>
                    <p className="text-gray-300 text-sm">"{item.question}"</p>
                  </div>
                  <div className="text-gray-600 shrink-0">
                    {expanded[i]
                      ? <ChevronUp size={16} />
                      : <ChevronDown size={16} />
                    }
                  </div>
                </div>

                {/* Expanded Answer */}
                {expanded[i] && (
                  <div className="px-4 pb-4 border-t border-[#1e1e2e]">
                    <div className="flex items-start gap-2 mt-3">
                      <MessageSquare className="text-blue-400 shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Answer</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.answer || 'Answer not saved.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}