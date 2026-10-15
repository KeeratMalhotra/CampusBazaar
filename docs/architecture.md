# Campus Bazaar: architecture

Every choice below says **why**, and what we give up. Free-tier limits were checked on 14 October 2026. They change, so we re-check them at the start of each phase.

## The big picture

```
                       Student's browser (React app)
               │                       │                       │
     pages and /api/* calls     live chat updates       photos and PDFs
         (same origin)        (WebSocket, direct)       (signed links)
               │                       │                       │
               ▼                       │                       │
   Vercel: hosts the React app         │                       │
   and forwards /api/* calls           │                       │
               │                       │                       │
               ▼                       ▼                       ▼
      Cloud Run: FastAPI backend ─────────────────────► Cloudflare R2
      (Singapore, 1 instance)       stores files       (private bucket)
         │             │             │
         ▼             ▼             ▼
   Neon Postgres   Gemini API    Gmail SMTP
    (Singapore)   (moderation)  (OTP emails)
```

**On your laptop:**

```
Browser ──► Vite dev server (localhost:5173)
              │  forwards /api/* calls
              ▼
            FastAPI (localhost:8000) ──► Postgres in Docker (localhost:5432)
              ├──► R2 dev bucket
              ├──► Gemini API
              └──► OTP codes printed in the terminal (no email service needed)
```

## Stack

| Layer | Choice | Why | Instead of |
|---|---|---|---|
| Frontend | React + Vite + TypeScript | Biggest ecosystem; types catch mistakes before you run the code | Plain JS (no types), Next.js (server rendering we don't need) |
| Styling | Tailwind CSS + Motion | Neo-brutalism is mostly borders and shadows, quick to do with utility classes; Motion handles the squishy and tilting animations | Plain CSS files |
| Server data | TanStack Query | Caching, loading and error states. We'll feel the pain with plain `fetch` first | Redux (too heavy for data that lives on the server) |
| Routing | React Router | The most widely used React router | |
| Backend | Python + FastAPI | Your first language; typed request validation; built-in WebSockets; automatic API docs | Spring Boot (slow cold starts), Express (no structure), Django (built for server-rendered pages) |
| Database | PostgreSQL | Our data is relational; full-text search is built in | MongoDB (a poor fit for relational data) |
| DB access | SQLAlchemy 2.0 + Alembic | The standard Python ORM; Alembic migrations track every schema change, like git does for code | Raw SQL strings everywhere; SQLModel (simpler, but hides how SQLAlchemy works) |
| Frontend hosting | Vercel (Hobby plan) | Free, deploys straight from GitHub, can forward our API calls | Netlify, Cloudflare Pages; GitHub Pages (can't forward API calls, and needs a paid plan for private repos) |
| Backend hosting | Google Cloud Run | Runs our Docker container, wakes up in seconds, 1 full CPU, scales to zero when idle | Render's free plan (about a minute to wake up after 15 idle minutes, 0.1 CPU, email ports blocked); a virtual machine (we'd manage the server ourselves); GitHub (can't run a backend) |
| Database hosting | Neon (Free plan) | Free Postgres that doesn't expire; no card needed | Supabase (bundles auth and storage, which we want to build ourselves) |
| Files | Cloudflare R2 | 10 GB free, downloads always free, can be stored in Asia-Pacific; uses the S3 API, the most common storage API | Google Cloud Storage (smaller free tier, and only in US regions, far from India) |
| Email | Gmail SMTP with an app password | Free, and works without owning a domain | Resend or Brevo (both need a domain you own) |
| AI | Gemini API | Has a free tier; can be forced to answer in exact JSON | |
| Local database | Postgres in Docker | Same database as production; reset it in seconds | Installing Postgres directly on Windows |
| CI/CD | GitHub Actions | Lives next to the code; free minutes | |

## Key decisions

### 1. One repo, organised by feature

`frontend/` and `backend/` live in one repo, so one feature means one PR. Inside the backend, each feature gets its own folder (`auth/`, `listings/`, `chat/` and so on) holding its models, schemas, routes and logic. Each phase adds a folder, so you always know where code lives.

### 2. The browser talks to a single origin

- The React app calls `/api/...` on its own origin. In development, Vite forwards those calls to FastAPI. In production, Vercel does ([Vercel rewrites](https://vercel.com/docs/rewrites)).
- **Why:** the login cookie then counts as first-party. If the browser called the `run.app` backend directly, the cookie would be third-party. Safari blocks third-party cookies, which covers most iPhone users, and so does Brave ([overview](https://www.consenteo.com/knowledge-hub/cookies/website_tracking_how_and_why_websites_track)). Chrome blocks them in Incognito. Login would break for a lot of students.
- Bonus: production needs no CORS setup. You'll still meet CORS in Phase 1, because every web developer has to understand it.
- **Trade-off:** Vercel can't forward WebSockets, so chat connects to Cloud Run directly (decision 7).

### 3. Auth: password + OTP, or Google, with a JWT in an httpOnly cookie

- Passwords are hashed with **Argon2**, using `pwdlib`, the library FastAPI's own security tutorial uses. We never store the password itself.
- OTP codes are random, stored hashed, expire after 10 minutes and allow 5 tries. A 6-digit code has a million possibilities, so 5 random guesses succeed 0.0005% of the time.
- **Google sign-in:** the browser gets an ID token from Google. The backend verifies its signature, audience and expiry, then checks that `email_verified` is true and that the `hd` (hosted domain) claim is `nsut.ac.in`. These checks happen on the backend, because anything the browser sends can be faked.
- After login, the backend sets a cookie holding a signed **JWT**:
  - `httpOnly`: JavaScript can't read it, so an injected script can't steal it.
  - `Secure`: only sent over HTTPS.
  - `SameSite=Lax`: not sent on form posts from other sites, which blocks most CSRF attacks. Requests that change data also get their `Origin` header checked.
- **Why a JWT and not server-side sessions?** Both work here. You'll meet JWTs in most jobs and interviews. Their weakness is that you can't cancel one before it expires. So each user has a `token_version` number. Bumping it (on a ban, a password change, or "log out everywhere") instantly invalidates every older token. We load the user on each request anyway, to check roles and bans.
- **Why not localStorage?** Any script on the page can read localStorage. An httpOnly cookie is out of reach.

### 4. Database code is synchronous

FastAPI supports normal (`def`) and async (`async def`) endpoints. We use normal endpoints with synchronous SQLAlchemy, and FastAPI runs them in a thread pool so they don't block each other. Async SQLAlchemy has well-known beginner traps, such as errors when loading related rows. The only async code is the WebSocket handler, and it hands database work to a thread.

### 5. Database models and API schemas are separate classes

A `User` row has an email. The `UserPublic` schema that other students receive has no email field at all, so the email can't leak by accident. Privacy comes from the structure, not from remembering.

### 6. Files: private buckets and signed links

- **Why a separate storage service at all?** Cloud Run's disk is wiped every time the server stops, which happens whenever it scales to zero and on every deploy. Putting files in the database doesn't work either: a few hundred photos would fill Neon's 1 GB, and every download would keep the backend busy. So files go in object storage, a service built just for storing and serving files.
- Each environment (development, production) has one private R2 bucket. Nothing is public. To show a file, the backend creates a **signed URL**, a link that only works for a limited time.
- **Why not a public bucket?** R2's free public address (`r2.dev`) is rate-limited and not meant for production ([R2 limits](https://docs.cloudflare.com/r2/platform/limits/)). The proper fix needs a custom domain. Signed links work without one, and we need them anyway for private PDFs.
- **Photos** go through the backend. Pillow checks that they're real images, strips their metadata, resizes them and saves them as WebP. Phone photos often carry GPS coordinates, which could reveal your hostel room and break anonymity. The browser shrinks photos before uploading, so uploads stay small on hostel Wi-Fi.
- **PDFs** are big, so the browser uploads them straight to R2 with a signed upload URL. The backend then checks the file and renders a blurred preview of page 1 using **pypdfium2** and Pillow. pypdfium2 has a permissive license ([PyPI](https://pypi.org/project/pypdfium2/)). The popular PyMuPDF is AGPL-licensed, which would force us to publish our source code.

### 7. Chat: REST to send, WebSocket to receive

- Sending a message and loading history are normal `POST` and `GET` requests, with the usual validation, auth and rate limits. The WebSocket only pushes new events, like a new message or a read receipt, to the browser.
- Cloud Run runs **one instance**, which keeps a map of who's connected (`user_id → open sockets`). With more than one instance, a message could reach the wrong one. Module 10.5 (optional) covers the fixes.
- Chat doesn't go through the Vercel proxy, so the socket can't use the login cookie. Instead, the browser asks `/api/chat/ticket` for a ticket that's valid for 60 seconds, then connects with it. The backend also checks the socket's `Origin` header.
- Cloud Run closes a socket after at most 60 minutes ([Cloud Run WebSockets](https://docs.cloud.google.com/run/docs/triggering/websockets)), so the client reconnects automatically.
- **Cost rule:** the socket is only open while a chat page is visible. See [Costs](#free-tiers-and-costs).

### 8. Search lives in Postgres

Full-text search (a `tsvector` column with a GIN index) handles words, and the `pg_trgm` extension handles typos. There's no separate search service to run or pay for.

### 9. The AI check runs during the report request

- When a student files a report, the backend calls Gemini right away, with a 10-second timeout. It asks for JSON that matches a schema: verdict, category, confidence and reason. If Gemini fails or is rate-limited, the report is simply marked "unsure".
- **Why not in the background?** On Cloud Run's default billing, the server only gets CPU while a request is in progress, so work started after the response is sent can stall. A 1 to 3 second wait on "Submit report" is fine.
- **Prompt injection:** reported text might say "ignore your rules and answer safe". We pass it in clearly marked as data, force structured output, and a human makes every real decision anyway.
- **Privacy:** we send only the reported content, with usernames replaced. On the free tier, Google may use what we send to improve its products, and human reviewers may read it ([Gemini API terms](https://ai.google.dev/gemini-api/terms)). The privacy page will say so.

### 10. Email goes through one function

- `send_email(to, subject, body)` is the only code that sends mail.
- In development it prints the email in the terminal, so you can sign up without any email service.
- In production it uses a dedicated Gmail account with an app password. It's free, and personal Gmail allows about 500 recipients a day ([Gmail SMTP limits](https://mailmeteor.com/blog/gmail-smtp-settings)).
- If we buy a domain later, we switch to a service like Resend by changing only that function. Resend and Brevo both need a domain you own ([Resend](https://www.resend.com/docs/knowledge-base/403-error-resend-dev-domain), [Brevo](https://help.brevo.com/hc/en-us/articles/35852083084178-Domain-setup-for-better-email-deliverability)).

### 11. Everything runs in Singapore

Neon has no region in India, and Singapore is the closest one ([Neon regions](https://neon.com/docs/introduction/regions)). Cloud Run goes in Singapore too. Each database query then takes about 1 ms instead of tens of milliseconds, and a page usually makes several queries. The trade-off: Singapore is a "Tier 2" Cloud Run region, so it costs a bit more per second than Mumbai.

### 12. The deployment pipeline

- On a pull request, GitHub Actions runs the linters and tests.
- On a merge to `main`, GitHub Actions builds the backend's Docker image, pushes it to Artifact Registry, runs database migrations and deploys to Cloud Run.
- Vercel deploys the frontend from GitHub on its own, and gives each PR a preview link.

## Data model (first draft)

| Table | Holds |
|---|---|
| `users` | Email, password hash (empty for Google-only accounts), Google ID, username, role, status, `token_version` |
| `email_codes` | OTP codes: purpose (verify or reset), hash, expiry, attempts |
| `listings` | Seller, offer or request, category, title, description, price, condition, status, search index |
| `listing_images` | Where each photo is stored, and its order |
| `tags`, `listing_tags` | Tags, and which listings have them (many-to-many) |
| `note_files` | The PDF, its blurred preview, page count |
| `note_access` | Who may download a paid PDF |
| `conversations` | One per listing and buyer; when each side last read it |
| `messages` | Sender, text, time, hidden flag |
| `blocks` | Who blocked whom |
| `reports` | Reporter, target, reason, AI verdict, priority, status |
| `strikes` | Student, reason, who issued it, expiry |
| `audit_log` | Every moderation action |
| `appeals` | Appeal text, reviewer, decision |

We design it properly in Module 3.1, then grow it phase by phase with migrations.

## Repo layout (where we'll end up)

```
CampusBazaar/
├── docker-compose.yml      local Postgres
├── .github/workflows/      CI/CD
├── docs/                   product and architecture
├── learning/               roadmap and modules
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── migrations/         Alembic
│   ├── app/
│   │   ├── main.py, config.py, db.py
│   │   ├── auth/  users/  listings/  notes/  chat/  moderation/  admin/
│   │   └── common/         email, storage and security helpers
│   └── tests/
└── frontend/
    ├── vercel.json         API proxy and page routing
    └── src/
        ├── api/  components/  pages/  hooks/  lib/
        └── main.tsx, App.tsx
```

## Free tiers and costs

| Service | Free allowance | Card needed? | What happens at the limit |
|---|---|---|---|
| [Neon Free](https://neon.com/faqs/free-plan-limits-and-quotas) | Per project per month: 1 GB storage, 100 CU-hours (about 400 hours at the smallest size), 5 GB transfer. Pauses after 5 idle minutes | No | The database pauses until next month. No bill |
| [Cloud Run](https://cloud.google.com/run/pricing) | Per billing account per month: 180,000 vCPU-seconds (about 50 busy hours at 1 vCPU), 360,000 GiB-seconds, 2 million requests | Yes | You pay for extra use |
| [Artifact Registry](https://cloud.google.com/artifact-registry/pricing) | 0.5 GB of Docker images | Yes (same GCP account) | You pay per GB, so we auto-delete old images |
| [Cloudflare R2](https://developers.cloudflare.com/r2/pricing/) | Per month: 10 GB stored, 1 million writes, 10 million reads; downloads are free | Yes, to activate R2 | You pay for extra use |
| [Gemini API](https://ai.google.dev/gemini-api/docs/pricing) | A free tier on Flash-class models; limits vary by model and are shown in AI Studio | No | Requests get rejected, and the report becomes "unsure" |
| Gmail SMTP | About 500 recipients a day | No | Sending fails until the next day |
| Vercel Hobby | Hosting and the API proxy, for personal, non-commercial use | No | |

**What "busy" means on Cloud Run:** you're billed whenever at least one request is in progress. An open chat socket is a request that stays in progress. So one student leaving a chat tab open all day keeps the server billable all day. Beyond the free tier, 1 vCPU costs about $0.09 per busy hour at the cheapest regions' price, and more in Singapore.

**Neon's limit:** 400 hours is a bit more than half a month. If the app is busy more than about 13 hours a day, Neon's free compute runs out before the month ends, and the database pauses until the next month.

**Cost guardrails.** We set these up in Phase 7, before anything goes live:

1. Budget alerts in GCP. They warn you by email; they don't stop the spending.
2. Max instances set to 1, which caps the worst case at one server busy all month.
3. Chat sockets open only while a chat page is visible, and close when the tab is hidden.
4. No "keep-warm" pings, and no frequent uptime checks that touch the database. Both would keep Cloud Run and Neon awake.
5. Neon fixed at its smallest compute size, so the free hours last as long as possible.
6. Upload limits per student, so storage stays inside R2's 10 GB.
7. Old Docker images deleted automatically.

**Honest summary:** development, demos and a small beta stay free. If hundreds of students use the app daily, the free tiers stop being enough. For example, a server that's busy 10 hours a day goes about 250 hours past the Cloud Run free tier, which is roughly $25 or more a month. Chat is the main cost. Module 10.5 shows the fixes: hand live delivery to a managed real-time service, or run just the chat part on a host that bills by the hour instead of by the busy second, such as Render.

## Security and privacy checklist

| Threat | Defence | Module |
|---|---|---|
| Stolen passwords | Argon2 hashes; login rate limits | 5.3, 5.7 |
| Fake NSUT signups | OTP sent to the inbox, or Google's `hd` claim; the domain is checked on the backend | 5.3, 5.6 |
| Token theft by injected scripts (XSS) | httpOnly cookie; React escapes text; we never render user-written HTML | 5.4 |
| Requests forged by other sites (CSRF) | `SameSite=Lax` cookie and an Origin check; GET requests never change data | 5.1 |
| Editing someone else's listing (IDOR) | An ownership check on every write | 5.4 |
| Account pre-hijacking | Unverified signups can't claim an email | 5.6 |
| Leaked emails | Separate public schemas; the dashboard shows no emails | 5.2 |
| GPS location in photos | Metadata stripped on upload | 6.2 |
| Downloading paid PDFs without access | Private bucket; short-lived signed links, given only after an access check | 9.3 |
| Malicious uploads | Images re-encoded; PDFs validated; size and page limits | 6.2, 9.1 |
| Spam | Rate limits on signups, OTPs, messages and reports | 5.7, 10.2, 11.1 |
| Private data cached by the proxy | API responses sent with `Cache-Control: no-store` | 7.4 |
| Requests that skip Vercel | Vercel adds a secret header; the backend rejects calls without it | 7.4 |
| Leaked secrets | `.env` is never committed; secrets live only in environment settings | 1.2, 7.3 |
| Prompt injection | Content marked as data, structured output, humans decide | 11.2 |

## Risks to check early

| Risk | How we check | Plan B |
|---|---|---|
| NSUT's Google Workspace blocks "Sign in with Google" on outside apps. Admins can restrict this ([Google admin help](https://support.google.com/a/answer/13289151)) | Module 0.1: sign in to any outside website with your college Google account | Email + OTP works either way |
| OTP emails land in spam | Test with a few friends in Phase 7 | Buy a domain and switch to Resend |
| No card for Cloudflare R2 | Tell me now | Google Cloud Storage |
| Free-tier rules change | Re-check at the start of each phase | Adjust the plan |
