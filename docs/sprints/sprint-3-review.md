```markdown
# Sprint 3 Review

**Date:** November 19, 2025  
**Team Members:** Junyi , Le , Jingyi 

---

## Sprint Goal
Complete social features: login redirect, create basic post, like/unlike, friends feed, quicklink.

**Achieved:** Mostly achieved — backend endpoints and debug/test-data utilities are in place; frontend pages were integrated locally for demo. See details below.

---

## Completed User Stories

- **POST /posts/** — create music posts (implemented in `backend/core/views.py` function `create_post`). See `backend/core/views.py`.  
- **POST /posts/<id>/like/** — like/unlike posts (implemented in `backend/core/views.py` function `like_post`). See `backend/core/views.py`.  
- **GET /posts/friends/** — friends feed with pagination and like metadata (implemented in `backend/core/views.py` function `friends_posts`). See `backend/core/views.py`.  
- **Token-based login `/token/`** — returns JWT for client-side auth (implemented in `backend/core/views.py` function `token_login`). See `backend/core/views.py`.  
- **Debug & test-data endpoints and management commands** — management command `create_test_dataset` and `create_test_user` exist, and a debug endpoint `debug/create-test-data/` is implemented. See `backend/core/management/commands/` and `backend/core/views.py`.

Notes: For commit-level evidence, run locally:

```
git log --pretty=oneline -- backend/core/views.py
git log --pretty=oneline -- backend/core/urls.py
```

Or to find PRs (if you use the `gh` CLI):

```
gh pr list --repo cjycarrie/MGT656-Final-Project --search "posts" --state merged
```

---

## Incomplete User Stories

- **Frontend cross-origin polish:** some CORS/CSRF flows required `credentials: 'include'` and proper token handling; frontend styling and error handling require follow-up.  
- **End-to-end tests:** automated tests for posting and likes were not added this sprint.

**Disposition:** carry these items into Sprint 4 with assigned owners.

---

## Demo Notes

- Demo user: `student_login` (password `123456`) — created by `python manage.py create_test_user`.  
- Demo journey: log in via token endpoint -> create a post using `POST /posts/` -> view feed `GET /posts/friends/` -> like a post using `POST /posts/<id>/like/`.  
- Files to show in demo: `backend/core/views.py`, `frontend/post/index.html`, `frontend/feed/index.html` (local files).  

---

## Metrics

- **Planned story points:** 22  
- **Completed story points:** 22 
- **Velocity for Sprint 3:** 22 story points  
- **Cumulative velocity (Sprints 2–3):** Sprint 2: 34, Sprint 3: 22 → cumulative 57

> Note: Story-point accounting is based on the sprint planning table; update if different in your backlog tool.

---

## Stakeholder Feedback

- Instructor/TA feedback: Redirect efforts to making a webpage app instead of mobile (ie. UI design).

---

## Backlog Refinements

- Move frontend polish and automated tests to top of backlog for Sprint 4.  

```
