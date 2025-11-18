```markdown
# Sprint 3 Planning

**Date:** November 13 – November 19, 2025  
**Duration:** 1 week

---

## Sprint Goal
Added user-facing social features — authentication flow with profile redirect, quick link setup, and endpoints for posts, likes, and friend feeds.

## Selected User Stories from Backlog

| Issue | Title | Story Points | Assignees |
|------:|------|:------------:|----------|
| #7 | Add `POST /posts/` to create music posts | 5 | Le |
| #8 | Add `POST /posts/<id>/like/` to like/unlike posts | 3 | Le |
| #9 | Add `GET /posts/friends/` friends feed endpoint | 5 | Le |
| #10 | Implement token-based login (`/token/`) and debug endpoints | 3 | Le |
| #11 | Implement quicklink feature for user profile navigation | 3 | Le |
| #12 | Add management command and debug endpoints to provision test dataset | 3 | Junyi |

**Total Committed Story Points:** 22

---

## Team Assignments

- **Le (Backend Lead):** Implement endpoints in `backend/core/views.py` and wire URLs in `backend/core/urls.py` (posts, likes, friends feed, token auth). Helped with frontend for this sprint with creating `post/` and `feed/` pages in `frontend/` and integrate with token or session auth. 
- **Jingyi (Product Owner):** Defined and prioritized sprint goals focused on completing core user-facing social features and ensuring alignment with the overall product vision. Collaborated with development team and validated deliverables.
- **Junyi (Database / QA):** Create and run the management command to seed test users and posts, verify DB migrations and dataset integrity.

---

## Dependencies and Risks

- **Dependencies:** Environment variables (`DATABASE_URL`, `SECRET_KEY`, optional `DEBUG_ADMIN_TOKEN`) must be set on Render or local `.env` for test-data endpoints.  
- **Risks:** Cross-origin auth flows (CORS and CSRF) may block frontend POSTs if not configured correctly; token/session mismatch between frontend and backend; rate limits/duplicate-post protection (the backend enforces one post per day per user).  

---

## Definition of Done

- Endpoints implemented and documented in repository.  
- Frontend pages can log in, get directed to profile page with quicklinks, and the friends feed returns posts with like counts.  
- Demo script / notes prepared for sprint review.

```
