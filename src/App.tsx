import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import TabBar from './ui/TabBar'
import TodayRoute from './routes/TodayRoute'
import GardenRoute from './routes/GardenRoute'
import SettingsRoute from './routes/SettingsRoute'

export default function App() {
  return (
    <HashRouter>
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="/today" element={<TodayRoute />} />
          <Route path="/garden" element={<GardenRoute />} />
          <Route path="/settings" element={<SettingsRoute />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </main>
      <TabBar />
    </HashRouter>
  )
}
