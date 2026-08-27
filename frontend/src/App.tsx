import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard      from './pages/Dashboard'
import ChallengeList  from './pages/ChallengeList'
import ChallengeView  from './pages/ChallengeView'
import SqlCaseList    from './pages/SqlCaseList'
import SqlCaseView    from './pages/SqlCaseView'
import SqlStageView   from './pages/SqlStageView'
import Shop           from './pages/Shop'
import Leaderboard    from './pages/Leaderboard'
import Login          from './pages/Login'
import Signup         from './pages/Signup'
import Profile        from './pages/Profile'
import NotFound       from './pages/NotFound'

export default function App() {
  return (
    <div>
      <Nav />
      <main className="container">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cases" element={<ProtectedRoute><ChallengeList /></ProtectedRoute>} />
          <Route path="/case/:caseId" element={<ProtectedRoute><ChallengeView /></ProtectedRoute>} />
          <Route path="/case/:caseId/stage/:stageId" element={<ProtectedRoute><ChallengeView /></ProtectedRoute>} />
          <Route path="/sql-cases" element={<ProtectedRoute><SqlCaseList /></ProtectedRoute>} />
          <Route path="/sql-cases/:slug" element={<ProtectedRoute><SqlCaseView /></ProtectedRoute>} />
          <Route path="/sql-stages/:id" element={<ProtectedRoute><SqlStageView /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
