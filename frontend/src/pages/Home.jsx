// import { useNavigate } from 'react-router-dom'
// import { FileText, Video, Globe } from 'lucide-react'

// export default function Home() {
//   const navigate = useNavigate()

//   return (
//     <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
      
//       {/* Header */}
//       <div className="text-center mb-16">
//         <div className="flex items-center justify-center gap-3 mb-4">
//           <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
//             <span className="text-white font-bold text-lg">✦</span>
//           </div>
//           <h1 className="text-4xl font-bold text-white">AI Knowledge Hub</h1>
//         </div>
//         <p className="text-gray-400 text-lg">What would you like to explore today?</p>
//       </div>

//       {/* Module Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        
//         {/* DocuAI Card */}
//         <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 flex flex-col gap-4 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
//           onClick={() => navigate('/docuai')}>
//           <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
//             <FileText className="text-blue-400" size={24} />
//           </div>
//           <div>
//             <p className="text-xs text-blue-400 font-medium mb-1">Document Intelligence</p>
//             <h2 className="text-xl font-bold text-white mb-2">DocuAI</h2>
//             <p className="text-gray-400 text-sm">Upload PDF or TXT files and chat with your documents using advanced RAG architecture.</p>
//           </div>
//           <button className="mt-auto w-full py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all">
//             Get Started →
//           </button>
//         </div>

//         {/* VideoMind Card */}
//         <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 flex flex-col gap-4 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
//           onClick={() => navigate('/videomind')}>
//           <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
//             <Video className="text-purple-400" size={24} />
//           </div>
//           <div>
//             <p className="text-xs text-purple-400 font-medium mb-1">YouTube Intelligence</p>
//             <h2 className="text-xl font-bold text-white mb-2">VideoMind</h2>
//             <p className="text-gray-400 text-sm">Paste a YouTube URL and extract key insights, summaries and answers from any video.</p>
//           </div>
//           <button className="mt-auto w-full py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-all">
//             Get Started →
//           </button>
//         </div>

//         {/* WebMind Card */}
//         <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 flex flex-col gap-4 hover:border-green-500 transition-all duration-300 cursor-pointer group opacity-60">
//           <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-all">
//             <Globe className="text-green-400" size={24} />
//           </div>
//           <div>
//             <p className="text-xs text-green-400 font-medium mb-1">Autonomous Research</p>
//             <h2 className="text-xl font-bold text-white mb-2">WebMind</h2>
//             <p className="text-gray-400 text-sm">Multi-agent web research that searches, reads and synthesizes live information.</p>
//           </div>
//           <button className="mt-auto w-full py-3 rounded-xl bg-[#1e1e2e] text-gray-400 font-medium cursor-not-allowed">
//             Coming Soon
//           </button>
//         </div>

//       </div>

//       {/* Footer */}
//       <p className="mt-16 text-gray-600 text-sm">
//         AI Knowledge Hub • Final Year Project • R R Institute of Technology
//       </p>
//     </div>
//   )
// }

import { useNavigate } from 'react-router-dom'
import { FileText, Video, Globe, ArrowRight, Search, MessageSquare, Layers, Zap } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8 overflow-auto">

      {/* Hero */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-2">
          <span className="text-xs text-blue-400 font-medium border border-blue-400/30 px-3 py-1 rounded-full bg-blue-400/5">
            ✦ AI-POWERED KNOWLEDGE PLATFORM
          </span>
        </div>
        <h1 className="text-5xl font-bold text-white mt-4 mb-4 leading-tight">
          Turn information<br />into knowledge.
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-12">
          Search your documents, understand YouTube videos, and conduct autonomous web research — all from one intelligent workspace.
        </p>

        {/* Module Cards */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Three Specialized Tools</p>
            <h2 className="text-xl font-bold text-white">Choose your workspace</h2>
          </div>
          <p className="text-gray-600 text-sm">DocuAI · VideoMind · WebMind</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">

          {/* DocuAI */}
          <div
            onClick={() => navigate('/docuai')}
            className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 cursor-pointer hover:border-blue-500/40 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1e1e2e] flex items-center justify-center relative">
                <FileText className="text-blue-400" size={18} />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Document Intelligence</p>
            <h3 className="text-white font-bold text-xl mb-2">DocuAI</h3>
            <p className="text-gray-500 text-sm mb-4">
              Search, understand and chat with your PDF and TXT documents using Retrieval-Augmented Generation.
            </p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['PDF / TXT', 'RAG', 'Conversational AI'].map(tag => (
                <span key={tag} className="text-xs text-gray-500 border border-[#2e2e3e] px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
              Open DocuAI <ArrowRight size={16} />
            </div>
          </div>

          {/* VideoMind */}
          <div
            onClick={() => navigate('/videomind')}
            className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 cursor-pointer hover:border-purple-500/40 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1e1e2e] flex items-center justify-center relative">
                <Video className="text-purple-400" size={18} />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">YouTube Intelligence</p>
            <h3 className="text-white font-bold text-xl mb-2">VideoMind</h3>
            <p className="text-gray-500 text-sm mb-4">
              Extract knowledge from YouTube videos and have intelligent conversations with their content.
            </p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['YouTube', 'Transcript', 'RAG'].map(tag => (
                <span key={tag} className="text-xs text-gray-500 border border-[#2e2e3e] px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all">
              Open VideoMind <ArrowRight size={16} />
            </div>
          </div>

          {/* WebMind */}
          <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 opacity-50">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1e1e2e] flex items-center justify-center relative">
                <Globe className="text-green-400" size={18} />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Autonomous Research</p>
            <h3 className="text-white font-bold text-xl mb-2">WebMind</h3>
            <p className="text-gray-500 text-sm mb-4">
              Research live web topics through a multi-agent pipeline that searches, reads, writes and critiques.
            </p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['Live Web', 'Multi-Agent', 'Research'].map(tag => (
                <span key={tag} className="text-xs text-gray-500 border border-[#2e2e3e] px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              Coming Soon
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-12">
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">A Unified Knowledge Process</p>
          <h2 className="text-2xl font-bold text-white mb-8">How AI Knowledge Hub works</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { num: '01', text: 'Choose a source' },
              { num: '02', text: 'Process information' },
              { num: '03', text: 'AI understands context' },
              { num: '04', text: 'Retrieve relevant knowledge' },
              { num: '05', text: 'Generate useful answers' },
            ].map(({ num, text }, i) => (
              <div key={num} className="flex flex-col gap-2">
                <span className="text-blue-400 text-xs font-mono">{num}</span>
                {i < 4 && <div className="hidden md:block h-px bg-[#1e1e2e] mt-2"></div>}
                <p className="text-gray-400 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Capabilities */}
        <div>
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Core Capabilities</p>
          <h2 className="text-2xl font-bold text-white mb-6">Built for intelligent knowledge work</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Search, label: 'Semantic Search', desc: 'Find answers by meaning, not just keywords' },
              { icon: MessageSquare, label: 'Conversational AI', desc: 'Chat naturally with your knowledge sources' },
              { icon: Layers, label: 'RAG Architecture', desc: 'Grounded answers with source citations' },
              { icon: Zap, label: 'Fast Processing', desc: 'Instant responses powered by Groq LPU' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
                <Icon className="text-blue-400 mb-3" size={20} />
                <p className="text-white text-sm font-medium mb-1">{label}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}