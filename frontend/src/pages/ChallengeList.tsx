import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type CaseItem = { id: number; title: string; summary?: string }

export default function ChallengeList() {
  const [cases, setCases] = useState<CaseItem[]>([])

  useEffect(() => {
    fetch('/api/challenges')
      .then((r) => r.json())
      .then(setCases)
      .catch(console.error)
  }, [])

  return (
    <div>
      <h2>Available Cases</h2>
      <ul>
        {cases.map((c) => (
          <li key={c.id}>
            <Link to={`/case/${c.id}`}>{c.title}</Link> — {c.summary}
          </li>
        ))}
      </ul>
    </div>
  )
}
