# Learning roadmap

How we build Campus Bazaar together, and what you'll know at the end.

## How each module works

1. **I write the module** as a file in `learning/` and open a PR. You merge it and run `git pull`.
2. **You do the work** on a new branch: run the commands, create the files, write the code, test it.
3. **You open a PR** and tell me in chat. I review it the way a senior developer would: what's good, what's wrong, what to change.
4. You make the fixes, merge, and answer the module's questions in chat. Then we move to the next module.

I'll usually send one or two modules at a time, so I can adjust each one to how the last one went.

### Inside a module

| Part | What it is |
|---|---|
| Goal | What works by the end |
| New concepts | Explained before you use them |
| Steps | Commands, files to create, code. Every snippet says whether you type it or a tool generates it |
| Checkpoint | How to test it, and what you should see |
| Your turn | A small task with no snippet, just a description |
| Questions | 2 or 3 "why" questions to check your understanding |

## My rules as your teacher

1. **Why before how.** Every file and field gets a reason. I'll say whether something is a firm convention, a common pattern, or just my choice.
2. **Generated vs written is always clear.** Output from tools gets its own commit, so the diff shows exactly what we wrote.
3. **Windows first.** Commands are written for PowerShell, and I'll warn you about Windows traps.
4. **One new idea at a time.** A tool only shows up once you've felt the problem it solves.
5. **Challenges are announced.** Expect about one planted bug per phase. I'll always tell you it's there, and roughly where.
6. **No guessing.** If I'm not sure about something, I'll say so and we check the docs. Free tiers and versions get re-checked at the start of each phase.
7. **Errors are lessons.** Paste me the full error message. I'll show you how to read it, not just fix it for you.

## Levels: when we speed up

| Level | What it looks like |
|---|---|
| 1. Guided (we start here) | Full snippets, every step explained |
| 2. Assisted | Snippets with gaps (`# TODO`); you write small functions yourself |
| 3. Spec-driven | I give you the requirements and some hints; you write the code |
| 4. Pair (vibe coding) | I write the routine parts; you write the core logic and review my code |

**We go up a level** when, for two modules in a row, you finish "Your turn" without hints, answer the questions correctly, and your PR only needs small fixes. **We go back down** whenever something feels too hard.

My guess: level 2 around Phase 4, level 3 around Phase 6, level 4 from Phase 10. Your progress decides, not the calendar.

## Phases and modules

Tick a box when that module's PR is merged. 🐛 marks a module where I already plan a challenge. There will be others.

### Phase 0: Foundations

- [ ] 0.1 Your workshop: VS Code, PowerShell, PATH, checking Python, Node, Git and Docker; Windows traps; testing "Sign in with Google" with your college account
- [ ] 0.2 How the web works: client and server, URLs, ports, HTTP methods, status codes, headers, JSON; browser DevTools
- [ ] 0.3 Our Git workflow: branches, commits, pull requests, reviews

### Phase 1: Walking skeleton (frontend and backend talking)

Stuck? PR #1 has my version of this phase. It includes the planted CORS bug, so don't copy that part blindly.

- [ ] 1.1 Backend hello world: virtual environments, pip, `requirements.txt`, the first FastAPI route, `/docs`, Ruff
- [ ] 1.2 Configuration and secrets: environment variables, `.env` vs `.env.example`, `.gitignore`, a health endpoint
- [ ] 1.3 Frontend scaffold: Vite + React + TypeScript, what every generated file does, Tailwind
- [ ] 1.4 Connecting the halves: `fetch`, `useState`, `useEffect`, and your first CORS error 🐛

### Phase 2: API fundamentals

- [ ] 2.1 REST and CRUD: listings stored in a Python list; path and query parameters; validation; status codes
- [ ] 2.2 Structuring the app: routers, feature folders, dependency injection (`Depends`)
- [ ] 2.3 Automated tests: pytest and FastAPI's test client

### Phase 3: Database

- [ ] 3.1 Thinking in tables: keys, relationships, indexes; designing our schema; Postgres in Docker
- [ ] 3.2 SQLAlchemy: engine, sessions, models
- [ ] 3.3 Migrations with Alembic
- [ ] 3.4 Listings in a real database: CRUD, transactions, pagination, tests on a separate test database

### Phase 4: Frontend fundamentals

- [ ] 4.1 Thinking in React: components, props, state, lists and keys
- [ ] 4.2 Pages and routing: React Router, layouts, URL parameters, a 404 page
- [ ] 4.3 Design system: the neo-brutalist theme in Tailwind; Button, Card, Input and Badge components
- [ ] 4.4 Server data: TanStack Query; loading, error and empty states
- [ ] 4.5 Forms: creating and editing listings; showing the backend's validation errors

🏁 **Milestone A: a marketplace on your laptop.** Browse and post listings, no login yet.

### Phase 5: Accounts and login

- [ ] 5.1 How login works: hashing, cookies, sessions vs JWT, CSRF; switching to the dev proxy (goodbye, CORS)
- [ ] 5.2 Users and anonymous usernames: the users table, a username generator, public vs private schemas
- [ ] 5.3 Sign up with OTP: Argon2, the domain check, codes that expire, the `send_email()` function
- [ ] 5.4 Logging in: a JWT in a cookie, `get_current_user`, `/me`, logout; protecting routes 🐛
- [ ] 5.5 Login screens: auth state in React, protected pages, redirects
- [ ] 5.6 Sign in with Google: OAuth client setup, verifying ID tokens, linking accounts safely
- [ ] 5.7 Forgot password, rate limiting, and Settings (changing your username)

### Phase 6: Listings, complete

- [ ] 6.1 The full listing: categories, offer or request, condition, tags (many-to-many), status, public profiles
- [ ] 6.2 Photos: R2 and the S3 API, Pillow, stripping GPS data, signed URLs
- [ ] 6.3 Listing screens: photos in the form, My Listings, mark as sold, delete
- [ ] 6.4 Your turn: the academic help board, built by you from a spec

### Phase 7: Going live

- [ ] 7.1 Docker: a Dockerfile for the backend; building and running it locally
- [ ] 7.2 The production database: Neon, connection strings, running migrations safely
- [ ] 7.3 Backend on Cloud Run: budget alerts first, Artifact Registry, deploying, environment settings, logs; real OTP emails
- [ ] 7.4 Frontend on Vercel: the API proxy, page routing, caching headers, Google sign-in in production
- [ ] 7.5 CI/CD: GitHub Actions for tests and automatic deploys

🏁 **Milestone B: the MVP is live.** Real NSUT accounts and listings, on the internet.

### Phase 8: Search

- [ ] 8.1 Full-text search in Postgres: `tsvector`, GIN index, ranking, typo tolerance
- [ ] 8.2 Filters, sorting and pagination: keyset pagination, search state in the URL, a debounced search box 🐛

### Phase 9: PDF notes

- [ ] 9.1 Direct uploads: signed upload URLs, bucket CORS, validating PDFs
- [ ] 9.2 Blurred previews: rendering page 1 on the server; limits and timeouts
- [ ] 9.3 Who can download: free vs paid notes, granting and revoking access

### Phase 10: Live chat

- [ ] 10.1 Real-time options: polling vs SSE vs WebSockets; conversations and messages
- [ ] 10.2 The WebSocket server: the connection registry, tickets, Origin checks, pushing events
- [ ] 10.3 Chat screens: live updates, reconnecting with backoff, unread badges, closing the socket when hidden
- [ ] 10.4 Your turn: blocking users
- [ ] 10.5 (Optional) More than one server: why chat breaks, how to fix it, and what it costs

🏁 **Milestone C: the full marketplace.** Search, PDF notes and live chat.

### Phase 11: Trust and safety

- [ ] 11.1 Reports: reasons, duplicates, limits; the report button
- [ ] 11.2 AI moderation: Gemini, JSON output, prompt design, prompt injection, timeouts
- [ ] 11.3 Roles and enforcement: role checks, moderator actions, the 3-strike engine, the audit log
- [ ] 11.4 The admin dashboard
- [ ] 11.5 Suspensions, bans and appeals

### Phase 12: Polish and launch

- [ ] 12.1 The neo-brutalist vibe: grain, floating blobs, tilting cards, squishy buttons, confetti; reduced motion
- [ ] 12.2 Mobile-first and accessible
- [ ] 12.3 Production readiness: error handling, logging, monitoring, backups, security headers
- [ ] 12.4 Launch: rules and privacy pages, account deletion, the first admins, a beta with friends

🏁 **Milestone D: launch.**

That's **54 modules**, one of them optional.

## How long it takes

| Phase | Modules | Hours (rough) |
|---|---|---|
| 0. Foundations | 3 | 6 |
| 1. Walking skeleton | 4 | 10 |
| 2. API fundamentals | 3 | 9 |
| 3. Database | 4 | 12 |
| 4. Frontend fundamentals | 5 | 15 |
| 5. Accounts and login | 7 | 25 |
| 6. Listings, complete | 4 | 12 |
| 7. Going live | 5 | 18 |
| 8. Search | 2 | 6 |
| 9. PDF notes | 3 | 9 |
| 10. Live chat | 5 | 15 |
| 11. Trust and safety | 5 | 15 |
| 12. Polish and launch | 4 | 10 |
| **Total** | **54** | **about 160** |

The hours include reading, doing, debugging and review. Debugging is the unpredictable part, so the real total could be anywhere from 120 to 200 hours. Faster levels in the later phases pull it down.

| Your pace | Milestone A | Milestone B (live) | Milestone C | Launch |
|---|---|---|---|---|
| 10 hours a week | week 6 | week 11 | week 14 | week 17 (about 4 months) |
| 20 hours a week | week 3 | week 6 | week 7 | week 9 (about 2 months) |

## What you'll know at the end

**What you'll have built:** a live full-stack app used by real students, a repo with about 50 reviewed PRs, and docs that explain every decision. The repo is private for now. Since we never commit secrets, you can make it public for your portfolio at any time.

| Area | What you'll be able to do |
|---|---|
| Web fundamentals | Explain HTTP, REST, cookies, the same-origin policy, CORS and WebSockets |
| Backend | Build APIs with FastAPI and Pydantic; design tables; use SQLAlchemy and migrations; full-text search; process uploaded files |
| Frontend | Build React + TypeScript apps with routing, server data, forms, a design system and animations |
| Security | Hash passwords; design OTP flows; use JWTs and OAuth safely; stop CSRF, XSS and IDOR; rate limiting; signed URLs |
| Cloud and DevOps | Docker, Cloud Run, Neon, R2 (S3 API), Vercel, secrets, CI/CD, logs, cost control |
| AI engineering | Call an LLM API, force structured output, defend against prompt injection, keep humans in charge of decisions |
| Professional workflow | Branches, PRs, code review, reading docs and error messages, debugging, writing docs |

**Interview questions you'll be able to answer from experience:** how to store passwords; sessions vs JWT; what CORS is and why it exists; how "Sign in with Google" works; what an index is and when it helps; what an N+1 query is; how signed URLs work; how to scale WebSocket chat; how to stop an AI from making final decisions.

**Where your DSA shows up:** generating unique usernames (collisions and retries), rate limiters (sliding windows), keyset pagination, debouncing, exponential backoff, search ranking.
