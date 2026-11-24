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
The plan was reordered after the design review (see "Design v2" below). Pages are built in this order.

| # | Step | Status |
|---|------|--------|
| 1 | Create the website project (Vite, React, React Router) | Done |
| 2 | Design tokens, fonts (Inter Tight, Inter, JetBrains Mono) and light/dark theme switch | Done |
| 3 | API helper, login state, protected routes, "waking server" message | Done |
| 4 | Real Sign up and Log in pages, with the Design v2 changes (privacy line, bigger text, page titles) | Done (v2 changes applied) |
| 5 | First online deploy on Vercel (CORS tightening, SPA rewrite). Add a short Privacy page and a proper 404 first, so no link leads nowhere | To do (next) |
| 6 | App shell: black sidebar on desktop, bottom tabs on phone | To do |
| 7 | Monitors page, with "No websites yet" and "Can't reach the server" states; needs a backend summary route first | To do |
| 8 | Site detail page (uptime, response time, check history) | To do |
| 9 | Public status page and Status pages list; needs a backend public route first | To do |
| 10 | Settings page (theme toggle, account, password, Delete my account); needs backend update and delete routes first | To do |
| 11 | Landing page with the scroll-built example card | Built early. Still to do: final Privacy, Terms, About and 404 pages |
| 12 | Polish, mobile check, visitor counter, final deploy | To do |

### Pages (11 in total)

| Page | Status |
|---|---|
| Landing | Built |
| Sign up | Built |
| Log in | Built |
| Monitors | To do (temporary placeholder exists) |
| Site detail | To do |
| Status pages list | To do |
| Public status page | To do |
| Settings | To do |
| Privacy, Terms, About | To do (footer and Sign up already link to them) |
| 404 | To do (currently a one-line "Page not found") |

## Design v2 (after the design review)

The first design was reviewed against the website design principles (score 7.5 out of 10). These gaps were fixed in a new design, drawn for both web and phone:

- **Who it is for and proof:** an audience line and a proof line on the Landing page.
- **Trust:** a real footer with About, Privacy, Terms and a contact email.
- **Privacy:** a privacy line on Sign up, and "Delete my account" in Settings with a type-DELETE confirmation.
- **Readability:** body text 16px, labels at least 13px, every tap area at least 44px.
- **Layers:** one card crosses from the top of the Landing page into the next section.
- **Search:** a title for each page, and a plain-text FAQ.
- **Measuring:** one goal number, signups per week (a privacy-friendly visitor counter comes in step 12).
- **Quiet screens:** empty state, "Can't reach the server" and 404.
- **Skipped on purpose:** the free "check my site" sample on the Landing page.
- **Motion:** the Landing page's one motion job is "show the product": the example Monitors card builds itself as you scroll. The headline and buttons never move. It is off on phones and for people who ask their device for less motion.

### Still to decide or do before launch

- Put the real contact email in `CONTACT_EMAIL` at the top of `frontend/src/pages/Landing.jsx`.
- Write the Privacy and Terms pages (plain-language drafts, to be read carefully before launch).
- "Email when it's down and when it's back" is only true once alert emails work in production (see Notes).
- "You can delete your account any time" is only true once Delete account is built in step 10.
- Choose a privacy-friendly visitor counter (step 12). Landing page pre-rendering for search is optional and later.

## Backend status

Done: signup and login, add / list / delete sites, automatic checker every 5 minutes, per-site stats, down and recovery alert emails.
Still needed for the frontend: a summary route (step 7), a public status route (step 9), account and password update routes (step 10), and a delete account route that also removes the user's sites and check history (step 10).

## Notes

- Alert emails use Gmail through Nodemailer. Render's free plan blocks this kind of email connection, so alerts work locally but need another solution when deployed.
- Render's free plan sleeps when idle, so the first request after a while can take about 30 seconds.
