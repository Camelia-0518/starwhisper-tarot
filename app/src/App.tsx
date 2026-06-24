import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Reading from './pages/Reading'
import Cards from './pages/Cards'
import HistoryPage from './pages/History'
import JournalPage from './pages/Journal'
import ShareReading from './pages/ShareReading'
import UserProfile from './pages/UserProfile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reading" element={<Reading />} />
      <Route path="/cards" element={<Cards />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/journal" element={<JournalPage />} />
      <Route path="/share/:slug" element={<ShareReading />} />
      <Route path="/profile" element={<UserProfile />} />
    </Routes>
  )
}
