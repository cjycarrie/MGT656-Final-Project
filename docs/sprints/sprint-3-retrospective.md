# Sprint 3 Retrospective

**Date:** November 18, 2025  
**Attendees:** Junyi , Le , Jingyi 

---

## What Went Well (minimum 3 items)

1. Backend endpoints for posts, likes, and friends feed were implemented and provide the required data shape for the frontend. 
2. Token-based auth was implemented and verified with debug endpoints (`token/`, `debug/token-check/`). 
3. Management commands and a debug API to seed test data made demos and local testing straightforward.
---

## What Didn't Go Well

1. The distribution of feature part responsibilities could have been better defined.
2. Story-point estimates were optimistic for the frontend integration work; more time was needed for error handling and UI feedback.

---

## What To Improve 

1. Improve CORS/CSRF plan and document expected flow before frontend implementation.  
   - **Action:** Create a short doc describing token flow, when to use session auth vs JWT, and example fetch calls.  
   - **Owner:** Le  
   - **Due:** 1 week 

2. Add an automated test or simple smoke test for `POST /posts/` and `POST /posts/<id>/like/`.  
   - **Action:** Implement minimal pytest/Django test cases for create and like flows.  
   - **Owner:** Le  
   - **Due:** 2 weeks

3. Improve frontend error handling and display for network/validation errors.  
   - **Action:** Add UI error banners and retry guidance on `post/` and `feed/` pages.  
   - **Owner:** Jingyi  
   - **Due:** 1 sprint

4. Work on main user story    
   - **Action:** Implement Spotify API support for posting songs with album cover metadata. 
   - **Owner:** Team 
   - **Due:** 1 sprint
---

## Action Items (owners & deadlines)

- **Le:** Write CORS/CSRF + token guidance doc — due in 1 week.  
- **Le:** Add two basic backend tests for posts/likes — due in 2 weeks.  
- **Jingyi:** Improve frontend error handling for posting and feed — due by next sprint.  
- **Junyi:** Add a small runbook for running `create_test_dataset` locally and in staging — due in 1 week.

---

## Team Dynamics Reflection

Overall the team collaborated effectively with clear communication. Communication around API contracts (request/response formats and required headers) should happen earlier in the sprint to reduce rework. Continue short daily syncs and a single documented API contract for frontend/backend work.

```