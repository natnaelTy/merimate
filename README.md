# Merimate

Freelancer CRM + AI follow-up assistant.

## Setup

1. Create a Supabase project and enable email + Google auth.
2. Run the SQL in `schema.sql`.
3. Copy `.env.example` to `.env` and fill in values.
4. Install dependencies and start the app.

```bash
npm install
npm run dev
```

## Supabase

- Auth: Email (magic link) + Google
- Database: Postgres (leads table, RLS)

## AI Follow-up

The API route `POST /api/ai/followup` uses an OpenAI-compatible endpoint.

Required env vars:

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (default: https://api.openai.com)
- `OPENAI_MODEL` (default: gpt-4o-mini)
