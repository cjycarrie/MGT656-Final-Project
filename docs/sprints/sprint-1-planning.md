```markdown
# Sprint 1 Planning

**Date:** Project Kickoff – (Sprint 1)
**Duration:** 1 week

---

## Sprint Goal
Establish the product vision, validate the problem with initial user research, define personas and a prioritized product backlog, and choose a technical architecture to support MVP development.

---

## Executive Summary
Trackly is a daily music-sharing platform that lets users post the song they are listening to once per day and view friends' submissions. The goal for Sprint 1 is to validate the core problem, collect initial user feedback, define personas and user journeys, and produce an INVEST-style backlog of user stories that will drive development.

---

## User Research & Problem Definition
- Primary findings: sharing music online feels performative, fragmented, or inconvenient; users want a lightweight, authentic space dedicated to song-sharing.
- Method: short Google Form survey (~6 respondents) and informal interviews with creative professionals.
- Key validation: 100% respondents wanted a dedicated music-sharing space; 75% said current ways of sharing are too passive.

## Personas
- **Bob (mid-20s):** Comfortable with apps, dislikes performative sharing, wants simple music sharing.
- **Lena (27, interior designer):** Uses music to focus and wants low-pressure, emotional interactions.
- **Anna (23):** Wants friend-focused discovery and a dedicated song-only feed.

---

## Product Backlog (selected INVEST-style user stories)
The following stories were drafted and prioritized in Sprint 1 (story points and priorities taken from early estimates):

- Create and edit user profile — 2 pts — Medium — `Profile Management`
- View my own profile page — 1 pt — Low — `Profile Management`
- Log out of my account — 1 pt — Low — `Account Access`
- Change app theme (light/dark) — 2 pts — Low — `App Customization`
- Empty-state message for feed — 1 pt — Low — `App Customization`
- Save favorite songs — 3 pts — Medium — `Social Interaction`
- Privacy toggle (public/private) — 2 pts — Medium — `Profile Management`
- Help page & About page — 1 pt each — Low — `Info Pages`
- View friend submissions and friend profiles — 3 pts / 1 pt — High/Low — `Social Interaction` / `Profile Management`
- Delete posted song, view song details, like a post, view number of likes — 2–3 pts each — Medium — `Profile Management`/`Social Interaction`

Total backlog created for MVP grooming: prioritized into early/MVP vs nice-to-have lists for planning future sprints.

---

## Wireframes / Mockups
- https://www.figma.com/design/txvfBH7Y70SzkothCUxvEr/MGT656--Trackly-Wireframes--celestial-leaf-?node-id=0-1&p=f

---

## Technical Architecture (decisions)
- Backend framework: Django (built-in auth and rapid development).  
- Database: PostgreSQL (Render-managed in later sprints).  
- Deployment platform (target): Render for CI/CD and hosted Postgres.  

---

## GitHub & Process Setup
- Repository: https://github.com/cjycarrie/MGT656-Final-Project
- Project board and issue tracking established; branch/commit conventions and review SLA agreed.

---

## Dependencies & Risks
- Dependencies: clear auth approach (session vs token) for frontend; wireframes/design assets; seeded test data for demos.  
- Risks: estimates for frontend integration, CORS/CSRF considerations, and dependency on third-party music APIs (Spotify) for metadata.

---

## Definition of Done (Sprint 1 scope)
- Personas, problem validation, and backlog completed and recorded.  
- Technical stack decision documented.  
- Project board populated with prioritized user stories and estimates.

```
