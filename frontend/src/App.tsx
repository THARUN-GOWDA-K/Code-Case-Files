import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ChallengeList from './pages/ChallengeList'
import ChallengeView from './pages/ChallengeView'

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <header>
        <h1>Code Case Files (MVP)</h1>
        <nav>
          <Link to="/">Cases</Link> | <Link to="/profile">Profile</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ChallengeList />} />
          <Route path="/case/:caseId" element={<ChallengeView />} />
        </Routes>
      </main>
    </div>
  )
}
