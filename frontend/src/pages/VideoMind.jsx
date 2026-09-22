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
} from 'lucide-react'
import axios from 'axios'


const API = 'http://localhost:8000'

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
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
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
        setVideoReady(true)
        setVideoInfo(data)

        setMessages([
          {
            role: 'assistant',
            content:
              `Video processed successfully!\n\n` +
              `Found ${data.word_count?.toLocaleString() || 0} words ` +
              `across ${data.chunks || 0} chunks.\n\n` +
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

  const handleAsk = async () => {
    if (!question.trim() || !videoReady || loading) {
      return
    }

    const currentQuestion = question.trim()

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

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>

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
                onClick={handleAsk}
                disabled={
                  !question.trim() ||
                  loading ||
                  !videoReady
                }
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all"
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