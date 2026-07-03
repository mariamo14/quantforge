import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './state/auth'
import { Layout } from './components/Layout'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { Tracks } from './pages/Tracks'
import { TrackDetail } from './pages/TrackDetail'
import { LessonPage } from './pages/LessonPage'
import { ProblemPage } from './pages/ProblemPage'
import { QuizPage } from './pages/QuizPage'
import { SubmissionsPage } from './pages/SubmissionsPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/tracks" element={<Tracks />} />
        <Route path="/tracks/:slug" element={<TrackDetail />} />
        <Route path="/lessons/:slug" element={<LessonPage />} />
        <Route path="/problems/:slug" element={<ProblemPage />} />
        <Route path="/quizzes/:slug" element={<QuizPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
