// import { Routes, Route } from 'react-router-dom'
// import Home from './pages/Home'
// import DocuAI from './pages/DocuAI'
// import VideoMind from './pages/VideoMind'

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/docuai" element={<DocuAI />} />
//       <Route path="/videomind" element={<VideoMind />} />
//     </Routes>
//   )
// }

// export default App

import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/sidebar'
import Home from './pages/Home'
import DocuAI from './pages/DocuAI'
import VideoMind from './pages/VideoMind'
import History from './pages/History'
import About from './pages/About'

export default function App() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docuai" element={<DocuAI />} />
          <Route path="/videomind" element={<VideoMind />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  )
}