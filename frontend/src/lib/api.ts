export async function submitCode(stageId: number, language: string, source: string, final = true) {
  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage_id: stageId, language, source, final }),
  })
  return res.json()
}
