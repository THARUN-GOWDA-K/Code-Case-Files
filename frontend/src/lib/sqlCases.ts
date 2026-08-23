// SQL-detective-case API client.
// Matches the style of src/lib/api.ts: plain fetch(), relative /api paths, no auth headers.

import { authenticatedFetch } from './auth'

export async function listSqlCases() {
  const res = await fetch('/api/sql-cases/cases')
  return res.json()
}

export async function getSqlCase(slug: string) {
  const res = await fetch(`/api/sql-cases/cases/${slug}`)
  return res.json()
}

export async function getSqlStage(stageId: number) {
  const res = await fetch(`/api/sql-cases/stages/${stageId}`)
  return res.json()
}

export async function submitSqlQuery(stageId: number, query: string) {
  const res = await authenticatedFetch(`/api/sql-cases/stages/${stageId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
  return res.json()
}
