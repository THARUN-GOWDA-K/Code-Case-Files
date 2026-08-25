import { authenticatedFetch, getToken } from './auth'

async function responseJson(res: Response) {
  const body = await res.json()
  if (!res.ok) throw new Error(body.detail || 'Request failed')
  return body
}

export async function submitCode(stageId: number, language: string, source: string, final = true) {
  const res = await authenticatedFetch('/api/submissions', {
    method: 'POST',
    body: JSON.stringify({ stage_id: stageId, language, source, final }),
  })
  return responseJson(res)
}

export async function getSubmissionStatus(taskId: string) {
  const res = await authenticatedFetch(`/api/submissions/${taskId}`)
  return responseJson(res)
}

export async function unlockHint(hintId: number) {
  const res = await authenticatedFetch('/api/hints/unlock', {
    method: 'POST',
    body: JSON.stringify({ hint_id: hintId }),
  })
  return responseJson(res)
}

export async function getAuthMe() {
  const token = getToken()
  if (!token) throw new Error('No token found')
  const res = await authenticatedFetch('/api/auth/me')
  return responseJson(res)
}

export async function getAttemptsMe() {
  const res = await authenticatedFetch('/api/attempts/me')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || 'Failed to fetch attempts')
  }
  return res.json()
}

export async function getStageDetail(caseId: number | string, stageId: number | string) {
  const res = await fetch(`/api/challenges/${caseId}/stages/${stageId}`)
  return responseJson(res)
}
