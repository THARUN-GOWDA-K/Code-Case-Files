import { authenticatedFetch } from './auth'

export async function submitCode(stageId: number, language: string, source: string, final = true) {
  const res = await authenticatedFetch('/api/submissions', {
    method: 'POST',
    body: JSON.stringify({ stage_id: stageId, language, source, final }),
  })
  return res.json()
}

export async function unlockHint(hintId: number) {
  const res = await authenticatedFetch('/api/hints/unlock', {
    method: 'POST',
    body: JSON.stringify({ hint_id: hintId }),
  })
  return res.json()
}

export async function getAuthMe() {
  const res = await authenticatedFetch('/api/auth/me')
  return res.json()
}

export async function getAttemptsMe() {
  const res = await authenticatedFetch('/api/attempts/me')
  return res.json()
}
