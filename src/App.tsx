import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import TabBar from './ui/TabBar'
import TodayRoute from './routes/TodayRoute'
import GardenRoute from './routes/GardenRoute'
import PlantDetailRoute from './routes/PlantDetailRoute'
import SettingsRoute from './routes/SettingsRoute'
import CodexRoute from './routes/CodexRoute'
import CodexDetailRoute from './routes/CodexDetailRoute'
import WeatherDetail from './weather/WeatherDetail'

export default function App() {
  return (
    <HashRouter>
      <main>
        <Routes>
          <Route path="/today" element={<TodayRoute />} />
          <Route path="/weather" element={<WeatherDetail />} />
          <Route path="/garden" element={<GardenRoute />} />
          <Route path="/plant/:id" element={<PlantDetailRoute />} />
          <Route path="/codex" element={<CodexRoute />} />
          <Route path="/codex/:speciesId" element={<CodexDetailRoute />} />
          <Route path="/settings" element={<SettingsRoute />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </main>
      <TabBar />
    </HashRouter>
  )
}
