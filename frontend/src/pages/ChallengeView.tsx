import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '../components/Editor'

export default function ChallengeView() {
  const { caseId } = useParams()
  const [caseData, setCaseData] = useState<any>(null)
  const [code, setCode] = useState<string>("# Write Python code here\n")
  const [result, setResult] = useState<any>(null)
  const [hints, setHints] = useState<any[]>([])


  useEffect(() => {
    if (!caseId) return
    fetch(`/api/challenges/${caseId}`)
      .then((r) => r.json())
      .then(setCaseData)
      .catch(console.error)
    // load hints for stage 1
    fetch(`/api/hints/stage/1`)
      .then((r) => r.json())
      .then(setHints)
      .catch(console.error)
  }, [caseId])

  async function handleSubmit(final = true) {
    setResult(null)
    const payload = { stage_id: 1, language: 'python', source: code, final }
    const res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const body = await res.json()
    setResult(body)
  }

  return (
    <div>
      <h2>{caseData?.title || 'Case'}</h2>
      <p>{caseData?.summary}</p>
      <Editor value={code} language="python" onChange={setCode} />
      <div style={{ marginTop: 8 }}>
        <button onClick={() => handleSubmit(false)}>Run (visible tests)</button>
        <button onClick={() => handleSubmit(true)} style={{ marginLeft: 8 }}>Submit (run hidden tests)</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <h3>Result</h3>
        <pre>{result ? JSON.stringify(result, null, 2) : 'No runs yet'}</pre>
      </div>
      <div style={{ marginTop: 12 }}>
        <h3>Hints</h3>
        <ul>
          {hints.map((h) => (
            <li key={h.id}>
              <strong>Hint {h.id}:</strong> <em>locked</em> — <button onClick={() => unlockHint(h.id)}>Unlock ({h.cost_points || 0} XP)</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  async function unlockHint(hintId: number) {
    const res = await fetch('/api/hints/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hint_id: hintId }) })
    if (res.ok) {
      const body = await res.json()
      alert('Unlocked: ' + body.text)
    } else {
      alert('Failed to unlock hint')
    }
  }
}
