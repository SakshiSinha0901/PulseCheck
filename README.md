# PulseCheck

PulseCheck is a website uptime monitor. You add the websites you care about, it checks them automatically every 5 minutes, keeps a history, and emails you when one goes down and again when it comes back.

## Tech stack

- **Frontend:** React, Vite, React Router, plain CSS variables (light and dark theme)
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Auth:** JWT login tokens, bcrypt password hashing
- **Checker:** node-cron schedule, axios requests
- **Alerts:** Nodemailer emails
- **Deploy:** Render (backend), Vercel (frontend), Neon (database)

## Project structure

```
PulseCheck/
├── backend/    Express server, database schema, checker, email alerts
└── frontend/   React website
```

## Running it on your computer

Open two terminals.

```powershell
# Terminal 1: the server
cd backend
npm install
npm run dev

# Terminal 2: the website
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The website runs at http://localhost:5173 and talks to the server at http://localhost:5000.
Private values live in `.env` files, which are never committed. Each folder has a `.env.example` showing which values are needed.

## Frontend build plan (12 steps)

Each step is built, tested in the browser, committed and pushed before the next one starts.

| # | Step | Status |
|---|------|--------|
| 1 | Create the website project (Vite, React, React Router) | Done |
| 2 | Design tokens, fonts (Inter Tight, Inter, JetBrains Mono) and light/dark theme switch | Done |
| 3 | API helper, login state, protected routes, "waking server" message | Done |
| 4 | Real Sign up and Log in pages | Written, being tested |
| 5 | First online deploy on Vercel (with CORS tightening and SPA rewrite) | To do |
| 6 | App shell: black sidebar on desktop, bottom tabs on phone | To do |
| 7 | Monitors page (list of sites); needs a backend summary route first | To do |
| 8 | Site detail page (uptime, response time, check history) | To do |
| 9 | Public status page and Status pages list; needs a backend public route first | To do |
| 10 | Settings page (theme toggle, account, password); needs backend update routes first | To do |
| 11 | Landing page with scroll animation | To do |
| 12 | Polish, mobile check, final deploy | To do |

## Backend status

Done: signup and login, add / list / delete sites, automatic checker every 5 minutes, per-site stats, down and recovery alert emails.
Still needed for the frontend: a summary route (step 7), a public status route (step 9), account and password update routes (step 10).

## Notes

- Alert emails use Gmail through Nodemailer. Render's free plan blocks this kind of email connection, so alerts work locally but need another solution when deployed.
- Render's free plan sleeps when idle, so the first request after a while can take about 30 seconds.
