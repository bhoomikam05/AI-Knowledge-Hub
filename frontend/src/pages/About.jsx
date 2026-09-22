import { BookOpen, Code2, Database, Zap, Globe } from 'lucide-react'

const team = [
  { name: 'Deekshitha R', role: 'Lead Developer', desc: 'RAG Architecture, Backend (FastAPI), Frontend (React), AI Pipeline', initials: 'DR', color: 'bg-blue-500/20 text-blue-400' },
  { name: 'Bhoomika M', role: 'Testing Engineer', desc: 'QA, System Testing & Deployment', initials: 'BM', color: 'bg-purple-500/20 text-purple-400' },
  { name: 'Harshitha S', role: 'Documentation Lead', desc: 'Technical Report, Presentation, Research Paper', initials: 'HS', color: 'bg-green-500/20 text-green-400' },
  { name: 'Divya K J', role: 'Requirements & Research Analyst', desc: 'Problem Statement Analysis, Literature Survey', initials: 'DK', color: 'bg-orange-500/20 text-orange-400' },
]

const techStack = [
  { label: 'Python', icon: Code2 },
  { label: 'FastAPI', icon: Zap },
  { label: 'LangChain', icon: Database },
  { label: 'React', icon: Globe },
  { label: 'ChromaDB', icon: Database },
  { label: 'Groq LLM', icon: Zap },
  { label: 'RAG', icon: BookOpen },
  { label: 'Tailwind CSS', icon: Code2 },
]

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <span className="text-xs text-blue-400 font-medium border border-blue-400/30 px-3 py-1 rounded-full bg-blue-400/5">
            Final-Year Engineering Project
          </span>
          <h1 className="text-4xl font-bold text-white mt-4 mb-3">About AI Knowledge Hub</h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            A multi-source AI platform designed to transform documents, videos and live web information into searchable and conversational knowledge.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-2">One Platform, Three Perspectives</p>
            <h2 className="text-2xl font-bold text-white mb-3">Knowledge should be accessible regardless of where it begins.</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              The project explores a unified interaction model for three distinct information sources. Each module applies the same clear workflow: provide a source, understand its context, retrieve what matters, and present an answer with traceable evidence.
            </p>
          </div>
          <div className="md:w-64 bg-[#1e1e2e] rounded-xl p-4 flex flex-col gap-3">
            <p className="text-white text-sm font-medium">Project objective</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Reduce the friction between finding information and turning it into reliable, useful understanding.
            </p>
            <div className="flex items-center gap-2 text-green-400 text-xs mt-2">
              <div className="w-4 h-4 rounded-full border border-green-400 flex items-center justify-center">✓</div>
              Interface prototype complete
            </div>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <div className="w-4 h-4 rounded-full border border-green-400 flex items-center justify-center">✓</div>
              DocuAI module complete
            </div>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <div className="w-4 h-4 rounded-full border border-green-400 flex items-center justify-center">✓</div>
              VideoMind module complete
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="mb-8">
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Specialized Modules</p>
          <h2 className="text-xl font-bold text-white mb-4">A consistent intelligence layer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Document Intelligence', name: 'DocuAI', desc: 'Transforms PDFs and text documents into searchable, conversational knowledge.', color: 'text-blue-400', border: 'border-blue-500/20' },
              { label: 'YouTube Intelligence', name: 'VideoMind', desc: 'Extracts structured insight from video transcripts and enables grounded conversation.', color: 'text-purple-400', border: 'border-purple-500/20' },
              { label: 'Autonomous Research', name: 'WebMind', desc: 'Coordinates specialized research agents to search, synthesize, and critique findings.', color: 'text-green-400', border: 'border-green-500/20' },
            ].map(({ label, name, desc, color, border }) => (
              <div key={name} className={`bg-[#0d0d14] border ${border} rounded-xl p-4`}>
                <p className={`text-xs ${color} mb-1`}>{label}</p>
                <p className="text-white font-bold text-lg mb-2">{name}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-8">
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Technology</p>
          <h2 className="text-xl font-bold text-white mb-4">Technology Ecosystem</h2>
          <div className="flex flex-wrap gap-2">
            {techStack.map(({ label }) => (
              <span key={label} className="text-sm text-gray-400 border border-[#2e2e3e] bg-[#0d0d14] px-3 py-1.5 rounded-full">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-8">
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">The Team</p>
          <h2 className="text-xl font-bold text-white mb-4">Built by</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.map(({ name, role, desc, initials, color }) => (
              <div key={name} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-sm font-bold shrink-0`}>
                  {initials}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{name}</p>
                  <p className="text-blue-400 text-xs mb-1">{role}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guide */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-3">Project Guide</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              SG
            </div>
            <div>
              <p className="text-white font-bold">Dr. Swetha G</p>
              <p className="text-gray-400 text-sm">Project Guide</p>
              <p className="text-gray-500 text-xs">R R Institute of Technology, Bengaluru · VTU</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}