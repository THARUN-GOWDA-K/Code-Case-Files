import React, { useEffect, useState } from 'react'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [attempts, setAttempts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(setUser)
      .catch(() => setUser(null))

    fetch('/api/attempts/me')
      .then((r) => r.json())
      .then(setAttempts)
      .catch(() => setAttempts([]))
  }, [])

  return (
    <div>
      <h2>Profile</h2>
      {user ? (
        <div>
          <p>
            <strong>{user.display_name}</strong> ({user.email}) — XP: {user.xp}
          </p>
        </div>
      ) : (
        <p>Not signed in</p>
      )}

      <h3>Attempts</h3>
      <ul>
        {attempts.map((a) => (
          <li key={a.id}>
            Stage {a.stage_id}: {a.status} — Score: {a.score} — {a.tests_passed}/{a.total_tests} — {a.submitted_at}
          </li>
        ))}
      </ul>
    </div>
  )
}
