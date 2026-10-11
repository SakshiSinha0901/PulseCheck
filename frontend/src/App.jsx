import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import WakingBanner from './components/WakingBanner'
import DesignCheck from './pages/DesignCheck'
import TempLogin from './pages/TempLogin'
import TempMonitors from './pages/TempMonitors'

// The map of the website: which address shows which page.
// Pages inside <ProtectedRoute> need a login. The temporary pages are replaced in the next steps.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<DesignCheck />} />
        <Route path="/login" element={<TempLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/monitors" element={<TempMonitors />} />
        </Route>
        <Route path="*" element={<p style={{ padding: 48 }}>Page not found.</p>} />
      </Routes>
      <WakingBanner />
    </>
  )
}
