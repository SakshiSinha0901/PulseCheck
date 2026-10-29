import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import WakingBanner from './components/WakingBanner'
import AuthPage from './pages/AuthPage'
import DesignCheck from './pages/DesignCheck'
import TempMonitors from './pages/TempMonitors'

// The map of the website: which address shows which page.
// Pages inside <ProtectedRoute> need a login. Temporary pages are replaced in later steps.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<DesignCheck />} />
        <Route path="/login" element={<AuthPage kind="login" />} />
        <Route path="/signup" element={<AuthPage kind="signup" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/monitors" element={<TempMonitors />} />
        </Route>
        <Route path="*" element={<p style={{ padding: 48 }}>Page not found.</p>} />
      </Routes>
      <WakingBanner />
    </>
  )
}
