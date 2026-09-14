// SQL-detective-case API client.
// Matches the style of src/lib/api.ts: relative /api paths with auth for player data.

import { authenticatedFetch } from "./auth";

async function fetchJson(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body.detail || "Request failed");
  return body;
}

export async function listSqlCases() {
  const res = await fetch("/api/sql-cases/cases");
  return fetchJson(res);
}

export async function getSqlCase(slug: string) {
  const res = await fetch(`/api/sql-cases/cases/${slug}`);
  return fetchJson(res);
}

export async function getSqlStage(stageId: number) {
  const res = await authenticatedFetch(`/api/sql-cases/stages/${stageId}`);
  return fetchJson(res);
}

export async function unlockSqlHint(
  stageId: number,
  kind: "regular" | "npc",
  index: number,
) {
  const res = await authenticatedFetch(
    `/api/sql-cases/stages/${stageId}/hints/unlock`,
    {
      method: "POST",
      body: JSON.stringify({ kind, index }),
    },
  );
  return fetchJson(res);
}

export async function submitSqlQuery(stageId: number, query: string) {
  const res = await authenticatedFetch(
    `/api/sql-cases/stages/${stageId}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ query }),
    },
  );
  return fetchJson(res);
}

export async function getMySqlSubmissions() {
  const res = await authenticatedFetch("/api/sql-cases/my-submissions");
  return fetchJson(res);
}
