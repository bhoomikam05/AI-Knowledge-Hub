// import { useState, useRef, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { ArrowLeft, Video, Send, Loader2, Youtube, FileText, Sparkles } from 'lucide-react'
// import axios from 'axios'

// const API = 'http://localhost:8000'

// export default function VideoMind() {
//   const navigate = useNavigate()
//   const [url, setUrl] = useState('')
//   const [processing, setProcessing] = useState(false)
//   const [videoReady, setVideoReady] = useState(false)
//   const [videoInfo, setVideoInfo] = useState(null)
//   const [messages, setMessages] = useState([])
//   const [question, setQuestion] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [summaryLoading, setSummaryLoading] = useState(false)
//   const [error, setError] = useState('')
//   const chatEndRef = useRef(null)

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   const handleProcessVideo = async () => {
//     if (!url.trim()) return
//     setProcessing(true)
//     setError('')
//     setVideoReady(false)
//     setMessages([])

//     try {
//       const res = await axios.post(`${API}/videomind/process`, { url })
//       if (res.data.status === 'error') {
//         setError(res.data.message)
//       } else {
//         setVideoReady(true)
//         setVideoInfo(res.data)
//         setMessages([{
//           role: 'assistant',
//           content: `✅ Video processed successfully! Found **${res.data.word_count?.toLocaleString()} words** across **${res.data.chunks} chunks**.\n\nYou can now ask questions or click "Get Summary" to get an overview.`,
//           sources: []
//         }])
//       }
//     } catch (err) {
//       setError('Failed to process video. Please check the URL and try again.')
//     }
//     setProcessing(false)
//   }

//   const handleGetSummary = async () => {
//     setSummaryLoading(true)
//     setMessages(prev => [...prev, { role: 'user', content: '📋 Generate a summary of this video' }])
//     try {
//       const res = await axios.get(`${API}/videomind/summary`)
//       setMessages(prev => [...prev, {
//         role: 'assistant',
//         content: res.data.answer,
//         sources: res.data.sources
//       }])
//     } catch {
//       setMessages(prev => [...prev, {
//         role: 'assistant',
//         content: 'Sorry, could not generate summary.',
//         sources: []
//       }])
//     }
//     setSummaryLoading(false)
//   }

//   const handleAsk = async () => {
//     if (!question.trim()) return
//     const q = question
//     setQuestion('')
//     setMessages(prev => [...prev, { role: 'user', content: q }])
//     setLoading(true)
//     try {
//       const res = await axios.post(`${API}/videomind/ask`, { question: q })
//       setMessages(prev => [...prev, {
//         role: 'assistant',
//         content: res.data.answer,
//         sources: res.data.sources
//       }])
//     } catch {
//       setMessages(prev => [...prev, {
//         role: 'assistant',
//         content: 'Sorry, something went wrong.',
//         sources: []
//       }])
//     }
//     setLoading(false)
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0a0f] flex flex-col">

//       {/* Header */}
//       <div className="border-b border-[#1e1e2e] px-6 py-4 flex items-center gap-4">
//         <button onClick={() => navigate('/')}
//           className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
//           <ArrowLeft size={18} /> Back
//         </button>
//         <div className="flex items-center gap-2">
//           <Video className="text-purple-400" size={20} />
//           <h1 className="text-white font-bold text-lg">VideoMind</h1>
//         </div>
//         <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
//           YouTube Intelligence
//         </span>
//       </div>

//       <div className="flex flex-1 overflow-hidden">

//         {/* Left Panel */}
//         <div className="w-80 border-r border-[#1e1e2e] flex flex-col p-4 gap-4">

//           {/* URL Input */}
//           <div className="flex flex-col gap-2">
//             <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">
//               YouTube URL
//             </label>
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && handleProcessVideo()}
//                 placeholder="https://youtube.com/watch?v=..."
//                 className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 text-xs"
//               />
//             </div>
//             <button
//               onClick={handleProcessVideo}
//               disabled={!url.trim() || processing}
//               className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
//             >
//               {processing ? (
//                 <><Loader2 size={16} className="animate-spin" /> Processing...</>
//               ) : (
//                 <><Youtube size={16} /> Process Video</>
//               )}
//             </button>
//           </div>

//           {/* Error */}
//           {error && (
//             <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
//               <p className="text-red-400 text-xs">{error}</p>
//             </div>
//           )}

//           {/* Video Info */}
//           {videoReady && videoInfo && (
//             <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 flex flex-col gap-2">
//               <p className="text-purple-400 text-xs font-medium">✅ Video Ready</p>
//               <p className="text-gray-400 text-xs">{videoInfo.word_count?.toLocaleString()} words processed</p>
//               <p className="text-gray-400 text-xs">{videoInfo.chunks} chunks indexed</p>
//             </div>
//           )}

//           {/* Summary Button */}
//           {videoReady && (
//             <button
//               onClick={handleGetSummary}
//               disabled={summaryLoading}
//               className="w-full py-2.5 rounded-xl bg-[#111118] border border-purple-500/30 hover:border-purple-400 disabled:opacity-50 text-purple-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
//             >
//               {summaryLoading ? (
//                 <><Loader2 size={16} className="animate-spin" /> Generating...</>
//               ) : (
//                 <><Sparkles size={16} /> Get Summary</>
//               )}
//             </button>
//           )}

//           {/* Instructions */}
//           {!videoReady && (
//             <div className="flex flex-col gap-3 mt-4">
//               <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">How it works</p>
//               {[
//                 { step: '1', text: 'Paste a YouTube video URL above' },
//                 { step: '2', text: 'Click Process Video to extract transcript' },
//                 { step: '3', text: 'Get a summary or ask questions' },
//               ].map(({ step, text }) => (
//                 <div key={step} className="flex items-start gap-3">
//                   <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{step}</span>
//                   <p className="text-gray-500 text-xs">{text}</p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Right Panel — Chat */}
//         <div className="flex-1 flex flex-col">

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
//             {messages.length === 0 ? (
//               <div className="flex-1 flex flex-col items-center justify-center text-center">
//                 <Youtube className="text-purple-400/30 mb-4" size={48} />
//                 <p className="text-gray-400 text-lg font-medium">Chat with any YouTube video</p>
//                 <p className="text-gray-600 text-sm mt-2">Paste a YouTube URL and start exploring</p>
//               </div>
//             ) : (
//               messages.map((msg, i) => (
//                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                   <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
//                     msg.role === 'user'
//                       ? 'bg-purple-500 text-white'
//                       : 'bg-[#111118] border border-[#1e1e2e] text-gray-200'
//                   }`}>
//                     <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
//                     {msg.sources && msg.sources.length > 0 && (
//                       <div className="mt-2 pt-2 border-t border-[#2e2e3e]">
//                         <p className="text-xs text-gray-500">Sources: {msg.sources.join(', ')}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//             {(loading || summaryLoading) && (
//               <div className="flex justify-start">
//                 <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl px-4 py-3 flex items-center gap-2">
//                   <Loader2 className="text-purple-400 animate-spin" size={16} />
//                   <span className="text-gray-400 text-sm">Thinking...</span>
//                 </div>
//               </div>
//             )}
//             <div ref={chatEndRef} />
//           </div>

//           {/* Input */}
//           <div className="border-t border-[#1e1e2e] p-4">
//             <div className="flex gap-3 max-w-4xl mx-auto">
//               <input
//                 type="text"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
//                 placeholder={videoReady ? "Ask anything about this video..." : "Process a video first..."}
//                 disabled={!videoReady}
//                 className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 text-sm disabled:opacity-50"
//               />
//               <button
//                 onClick={handleAsk}
//                 disabled={!question.trim() || loading || !videoReady}
//                 className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all">
//                 <Send size={18} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Video,
  Send,
  Loader2,
  // YoutubeIcon,
  Sparkles,
  ListChecks,
  MessageSquarePlus,
} from 'lucide-react'
import axios from 'axios'


const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SUGGESTED_QUESTIONS = [
  {
    text: "Explain this in simple terms",
    icon: Sparkles,
    color: "from-purple-500/10 to-indigo-500/10 hover:border-purple-400/50",
    iconColor: "text-purple-400",
  },
  {
    text: "Give the key details",
    icon: ListChecks,
    color: "from-blue-500/10 to-cyan-500/10 hover:border-blue-400/50",
    iconColor: "text-blue-400",
  },
  {
    text: "Tell me more about this",
    icon: MessageSquarePlus,
    color: "from-purple-500/10 to-pink-500/10 hover:border-pink-400/50",
    iconColor: "text-pink-400",
  },
]

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
                  <th key={i} className="px-3 py-2 text-left font-semibold text-purple-300">
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

    // Section headings
    const firstLine = lines[0]
    const headingMatch = firstLine.match(/^(?:\#{1,4}\s*|\*{2})([^\*]+)(?:\*{2})?$/)
    if (headingMatch && lines.length === 1 && !firstLine.includes(':')) {
      const headingText = headingMatch[1].trim()
      return (
        <h3 key={pIdx} className="text-sm font-bold text-purple-300 mt-4 mb-2 uppercase tracking-wider">
          {headingText}
        </h3>
      )
    }

    // Bullet/Numbered lists
    const isList = lines.every(l => /^[\*\-•]\s|^\d+[\.\)]\s/.test(l))
    if (isList) {
      return (
        <ul key={pIdx} className="space-y-1.5 my-2">
          {lines.map((l, lIdx) => {
            const cleanLine = l.replace(/^[\*\-•]\s*|^\d+[\.\)]\s*/, '')
            return (
              <li key={lIdx} className="flex items-start gap-2 text-sm text-gray-200">
                <span className="text-purple-400 font-bold mt-0.5 text-xs shrink-0">•</span>
                <span className="flex-1">{renderInlineText(cleanLine)}</span>
              </li>
            )
          })}
        </ul>
      )
    }

    // Paragraph block
    return (
      <div key={pIdx} className="my-2 space-y-1 text-sm text-gray-200 leading-relaxed">
        {lines.map((line, lIdx) => {
          if (/^[\*\-•]\s|^\d+[\.\)]\s/.test(line)) {
            const clean = line.replace(/^[\*\-•]\s*|^\d+[\.\)]\s*/, '')
            return (
              <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                <span className="text-purple-400 font-bold mt-0.5 text-xs shrink-0">•</span>
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
                <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
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

export default function VideoMind() {
  // const navigate = useNavigate()

  const [url, setUrl] = useState('')
  const [processing, setProcessing] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoInfo, setVideoInfo] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState('')

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }, [messages])

  const handleProcessVideo = async () => {
    if (!url.trim()) return

    setProcessing(true)
    setError('')
    setVideoReady(false)
    setVideoInfo(null)
    setMessages([])

    try {
      const response = await axios.post(
        `${API}/videomind/process`,
        {
          url: url.trim(),
        }
      )

      const data = response.data

      if (data.status === 'error') {
        setError(
          data.message || 'Could not process the video.'
        )
      } else {
        const wordCount = typeof data.word_count === 'number' ? data.word_count : 0
        const chunkCount = typeof data.chunks === 'number' ? data.chunks : 0

        if (chunkCount === 0 || wordCount === 0) {
          setError('Could not retrieve a usable transcript or speech content for this video. Please ensure the video is public and has captions or clear audio.')
          setVideoReady(false)
          return
        }

        setVideoReady(true)
        setVideoInfo(data)

        setMessages([
          {
            role: 'assistant',
            content:
              `Video processed successfully!\n\n` +
              `Found ${wordCount.toLocaleString()} words ` +
              `across ${chunkCount} chunks.\n\n` +
              `You can now ask questions or click "Get Summary".`,
            sources: [],
          },
        ])
      }
    } catch (err) {
      console.error('Process video error:', err)

      setError(
        'Failed to process video. Please check the YouTube URL and make sure the backend is running.'
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleGetSummary = async () => {
    if (!videoReady) return

    setSummaryLoading(true)

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: 'Generate a summary of this video',
      },
    ])

    try {
      const response = await axios.get(
        `${API}/videomind/summary`
      )

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            response.data.answer ||
            'No summary was returned.',
          sources: response.data.sources || [],
        },
      ])
    } catch (err) {
      console.error('Summary error:', err)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I could not generate the summary.',
          sources: [],
        },
      ])
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleAsk = async (promptText = null) => {
    const textToAsk = typeof promptText === 'string' ? promptText : question
    if (!textToAsk.trim() || !videoReady || loading) {
      return
    }

    const currentQuestion = textToAsk.trim()

    setQuestion('')

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: currentQuestion,
      },
    ])

    setLoading(true)

    try {
      const response = await axios.post(
        `${API}/videomind/ask`,
        {
          question: currentQuestion,
        }
      )

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            response.data.answer ||
            'Sorry, I could not find an answer.',
          sources: response.data.sources || [],
        },
      ])
      const historyItem = {
        type: 'video',
        title: url || 'YouTube Video',
        time: new Date().toLocaleString(),
        question: currentQuestion,
        answer: response.data.answer,
        detail: 'Answer from video transcript'
      }
      const existing = JSON.parse(localStorage.getItem('ai_hub_history') || '[]')
      localStorage.setItem('ai_hub_history', JSON.stringify([historyItem, ...existing]))
    } catch (err) {
      console.error('Question error:', err)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, something went wrong while answering your question.',
          sources: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">

      {/* Header */}
      <div className="border-b border-[#1e1e2e] px-6 py-4 flex items-center gap-4">

        {/* <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button> */}

        <div className="flex items-center gap-2">
          <Video
            className="text-purple-400"
            size={20}
          />

          <h1 className="text-white font-bold text-lg">
            VideoMind
          </h1>
        </div>

        <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
          YouTube Intelligence
        </span>

      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Panel */}
        <div className="w-80 border-r border-[#1e1e2e] flex flex-col p-4 gap-4">

          {/* YouTube URL */}
          <div className="flex flex-col gap-2">

            <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              YouTube URL
            </label>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleProcessVideo()
                }
              }}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-[#111118] border border-[#1e1e2e] rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 text-xs"
            />

            <button
              onClick={handleProcessVideo}
              disabled={!url.trim() || processing}
              className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <span className="text-base">▶</span>
                  Process Video
                </>
              )}
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-xs">
                {error}
              </p>
            </div>
          )}

          {/* Video Info */}
          {videoReady && videoInfo && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 flex flex-col gap-2">

              <p className="text-purple-400 text-xs font-medium">
                Video Ready
              </p>

              <p className="text-gray-400 text-xs">
                {videoInfo.word_count?.toLocaleString() || 0}{' '}
                words processed
              </p>

              <p className="text-gray-400 text-xs">
                {videoInfo.chunks || 0} chunks indexed
              </p>

            </div>
          )}

          {/* Summary */}
          {videoReady && (
            <button
              onClick={handleGetSummary}
              disabled={summaryLoading}
              className="w-full py-2.5 rounded-xl bg-[#111118] border border-purple-500/30 hover:border-purple-400 disabled:opacity-50 text-purple-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {summaryLoading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Get Summary
                </>
              )}
            </button>
          )}

          {/* Instructions */}
          {!videoReady && (
            <div className="flex flex-col gap-3 mt-4">

              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                How it works
              </p>

              {[
                {
                  step: '1',
                  text: 'Paste a YouTube video URL above',
                },
                {
                  step: '2',
                  text: 'Click Process Video to extract the transcript',
                },
                {
                  step: '3',
                  text: 'Get a summary or ask questions',
                },
              ].map(({ step, text }) => (
                <div
                  key={step}
                  className="flex items-start gap-3"
                >

                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {step}
                  </span>

                  <p className="text-gray-500 text-xs">
                    {text}
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">

                {/* <YoutubeIcon
                  className="text-purple-400/30 mb-4"
                  size={48}
                /> */}
                <div className="text-purple-400/30 text-5xl mb-4">
  ▶
                  </div>

                <p className="text-gray-400 text-lg font-medium">
                  Chat with any YouTube video
                </p>

                <p className="text-gray-600 text-sm mt-2">
                  Paste a YouTube URL and start exploring
                </p>

              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >

                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-purple-500 text-white'
                        : 'bg-[#111118] border border-[#1e1e2e] text-gray-200'
                    }`}
                  >

                    {message.role === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      formatMessageContent(message.content)
                    )}

                    {message.sources &&
                      message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#2e2e3e]">

                          <p className="text-xs text-gray-500">
                            Sources:{' '}
                            {message.sources.join(', ')}
                          </p>

                        </div>
                      )}

                  </div>

                </div>
              ))
            )}

            {/* Loading */}
            {(loading || summaryLoading) && (
              <div className="flex justify-start">

                <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl px-4 py-3 flex items-center gap-2">

                  <Loader2
                    className="text-purple-400 animate-spin"
                    size={16}
                  />

                  <span className="text-gray-400 text-sm">
                    Thinking...
                  </span>

                </div>

              </div>
            )}

            <div ref={chatEndRef} />

          </div>

          {/* Question Input */}
          <div className="border-t border-[#1e1e2e] p-4">

            {videoReady && (
              <div className="max-w-4xl mx-auto mb-3">
                <p className="text-[11px] text-gray-500 font-medium mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-purple-400" />
                  Suggested Questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SUGGESTED_QUESTIONS.map(({ text, icon: Icon, color, iconColor }) => (
                    <button
                      key={text}
                      onClick={() => handleAsk(text)}
                      disabled={loading}
                      className={`group bg-gradient-to-r ${color} bg-[#111118] border border-[#1e1e2e] rounded-xl px-3 py-2 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center gap-2.5 cursor-pointer shadow-sm`}
                    >
                      <div className={`p-1.5 rounded-lg bg-[#1e1e2e]/80 ${iconColor} group-hover:scale-110 transition-transform shrink-0`}>
                        <Icon size={14} />
                      </div>
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate flex-1">
                        {text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 max-w-4xl mx-auto">

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAsk()
                  }
                }}
                placeholder={
                  videoReady
                    ? 'Ask anything about this video...'
                    : 'Process a video first...'
                }
                disabled={!videoReady}
                className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 text-sm disabled:opacity-50"
              />

              <button
                onClick={() => handleAsk()}
                disabled={
                  !question.trim() ||
                  loading ||
                  !videoReady
                }
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all cursor-pointer"
              >
                <Send size={18} />
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}