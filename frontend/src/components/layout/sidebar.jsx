import { useNavigate, useLocation } from 'react-router-dom'
import { Home, FileText, Video, Clock, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/docuai', icon: FileText, label: 'DocuAI' },
  { path: '/videomind', icon: Video, label: 'VideoMind' },
  { path: '/history', icon: Clock, label: 'History' },
  { path: '/about', icon: Info, label: 'About' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`relative min-h-screen bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-60'
    }`}>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-[#1e1e2e] border border-[#2e2e3e] rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className={`px-4 py-5 border-b border-[#1e1e2e] flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">✦</span>
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-base whitespace-nowrap">AI Knowledge Hub</span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              title={collapsed ? label : ''}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                collapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-[#1e1e2e] text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#1e1e2e]/50'
              }`}
            >
              <Icon size={17} className={active ? 'text-blue-400' : ''} />
              {!collapsed && label}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-[#1e1e2e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-blue-400 text-xs font-bold">DR</span>
            </div>
            <div>
              <p className="text-white text-xs font-medium">Final Year Project</p>
              <p className="text-gray-500 text-xs">RRIT • VTU • 2027</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}