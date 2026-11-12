# VA Career Launch AI

An AI-powered career assistant for aspiring Filipino Virtual Assistants: resume builder, proposal generator, job application assistant, job description analyzer, interview prep, and follow-up message generator.

Built with **Next.js 16, TypeScript, Tailwind CSS**, and **Claude** (Anthropic API) on the server.

---

## 1. What's inside (in plain words)

| Folder / file | What it does |
|---|---|
| `src/app/page.tsx` | The public landing page |
| `src/app/(app)/dashboard` | The dashboard with the six tools |
| `src/app/(app)/tools/*` | One page per tool |
| `src/app/api/generate/[tool]/route.ts` | **The only place that talks to the AI.** Runs on the server, so your API key stays secret |
| `src/lib/ai/schemas.ts` | Rules for valid form input + the exact shape of AI answers |
| `src/lib/ai/prompts/*.ts` | One prompt file per tool. `shared.ts` holds the honesty rules (never invent experience, etc.) |
| `src/lib/ai/client.ts` | Connects to Claude; turns technical errors into friendly messages |
| `src/lib/export/*` | Creates PDF and Word (.docx) files, in the browser |
| `src/lib/access/` | Paid-access check, **off by default**, separate from the AI code |
| `src/app/api/payments/webhook` | Placeholder for a future payment provider. It refuses all requests for now |
| `src/lib/pricing.ts` | The ₱299 / ₱499 prices shown on the landing page |
| `tests/` | Automated tests plus a fake AI server for testing without spending credits |

**Privacy:** No database. Nothing the user types is saved by the app. Resume contact details (name, email, phone, location, link) never leave the browser; they are not sent to the AI.

---

## 2. Run it on your computer

You need [Node.js](https://nodejs.org) version 20 or newer.

```bash
npm install                 # download the libraries (one time)
cp .env.example .env.local  # create your private settings file
```

Open `.env.local` in a text editor and paste your key after `ANTHROPIC_API_KEY=`.
(Get one at https://platform.claude.com → API Keys. You'll need to add credits to your account.)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 3. Test it

```bash
npm run build   # build the app (also checks for type errors)
npm test        # run the 20 automated browser tests
```

The tests use a **fake AI server**, so they're free and don't need a key. They check every tool, form validation, error messages, PDF and Word downloads, mobile layout, and that private contact details are never sent to the AI.

**Testing with the real AI** (uses a small amount of credit): run `npm run dev` with your key in `.env.local`, then try each tool by hand. Check that the results only use the information you typed.

---

## 4. Deploy (put it on the internet), using Vercel

Vercel is made by the creators of Next.js and has a free tier.

1. Push this project to GitHub (already done if you're reading this on GitHub).
2. Go to https://vercel.com and sign in with GitHub.
3. Click **Add New → Project** and pick this repository.
4. Open **Environment Variables** and add `ANTHROPIC_API_KEY` with your key. Optionally add the other variables from `.env.example`.
5. Click **Deploy**. After about a minute you'll get a live link.
6. Open the link and test the Resume Builder once from start to finish.

Notes:
- Each AI request can take 20–60 seconds. The API route allows up to 120 seconds (`maxDuration`). If your Vercel plan has a lower limit, set `ANTHROPIC_EFFORT=low` for faster answers.
- To change settings later: Vercel → Project → Settings → Environment Variables, then **Redeploy**.

---

## 5. Costs and limits to know about

- **AI costs** are billed by Anthropic per use. Each generation uses a few thousand tokens. Watch your usage in the Anthropic console and set a spending limit there.
- The default model is `claude-opus-5-5` (best quality). To lower costs you can set `ANTHROPIC_MODEL=claude-sonnet-5-5`. Test the quality first.
- **Rate limit:** each visitor can make 30 generations per hour (`RATE_LIMIT_PER_HOUR`). This counter lives in server memory, so on Vercel it's per server instance and resets on restarts. That's fine for launch; for stronger protection later, use a shared store such as Upstash Redis.

---

## 6. Adding payments later

Payment is **prepared but not implemented**, on purpose. No fake checkout exists, and nothing can mark a payment as complete.

When you choose a provider (e.g. PayMongo or Xendit, which support GCash and Maya):

1. Put the provider's keys in environment variables, never in code.
2. In `src/app/api/payments/webhook/route.ts`, verify the provider's webhook signature using its official docs.
3. Only for a verified, successful payment, call `createAccessToken()` from `src/lib/access` and deliver it to the buyer (for example, an emailed link that sets the `vacl_access` cookie).
4. Set `PAYWALL_ENABLED=true` and a long random `ACCESS_TOKEN_SECRET`.

The AI route already checks `hasAccess()` and returns a clear "requires paid access" message when the paywall is on.

**Trade-off to decide then:** without user accounts, access is tied to a browser cookie (lost if the user clears it or changes devices). If that becomes a problem, add authentication and a small database. That's more setup, but it supports log-in from any device.
