# Code Case Files Frontend

The frontend is a React 18, Vite, and TypeScript detective terminal. It contains two playable tracks:

- **Python Challenge Path**: Monaco-based Python editing with asynchronous grading, starter code, test results, XP, and authenticated Evidence Files.
- **SQL Detective Path**: SQL case navigation, schema context, a SELECT-only query terminal, Clue Notes, and server-gated NPC Advisors.

## Local Setup

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server proxies API requests according to `vite.config.ts`. Prepare the backend separately from `backend/`.

## Hint Economy

Every seeded stage has three progressive hint tiers priced uniformly at **0, 2, and 5 XP**. This applies to Python Evidence Files, SQL Clue Notes, and Blake, Maya, and Riya advisor hints. Locked text is not sent to the client; the authenticated backend records each user unlock before returning the text.

## Detective Shop

The catalog intentionally contains only items with real backend effects:

- **Hint Token**: costs 5 XP. Choose Python or SQL and a stage ID in the inventory panel to unlock that stage's next regular hint.
- **XP Booster (2x)**: costs 10 XP. Activating it doubles the XP from the next successful Python or SQL stage solve, then consumes the booster.

The inventory panel reports use success or failure through the existing noir toast system.

## Database Reset

After pulling schema-changing backend work, run this from `backend/`:

```bash
python app/reset_db.py --yes
```

This fully drops, recreates, and reseeds the database. The `--yes` flag is a required safety guard. When `DATABASE_URL` is omitted, the SQLite fallback is anchored at `backend/dev.db` regardless of invocation directory; running backend commands from `backend/` remains the recommended convention.

## Current Content

The Python path has 6 seeded cases and 13 playable stages. Every Python stage has a prompt, description, starter code, executable test cases, and three authored hints. The SQL path has 2 YAML-authored cases and 6 stages.
