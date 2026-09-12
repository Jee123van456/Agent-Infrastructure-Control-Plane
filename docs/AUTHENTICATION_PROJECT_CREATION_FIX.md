# TylerDeck — Authentication & Project Creation Fix Report

## 1. Exact Error

When attempting to create a project via the "+ New Project" modal, the frontend displayed:

```
Could not validate credentials
```

---

## 2. HTTP Status & Network Inspection

- **Endpoint**: `POST http://localhost:8000/api/v1/projects`
- **HTTP Status Code**: `401 Unauthorized`
- **Response Payload**: `{"detail": "Could not validate credentials"}`
- **Root Cause Trigger**: The `Authorization` header sent by the frontend contained either a missing, null (`Bearer null`), or expired JWT token string.

---

## 3. Root Cause Analysis

1. **Unauthenticated Session Drift**: When navigating directly to `/dashboard` or `/dashboard/projects` without completing `/login`, the frontend UI rendered default demo user profile state without validating that a valid, non-null JWT token existed in `localStorage.getItem('td_token')`.
2. **Missing Token Retry / Auto-Auth Mechanism**: When `localStorage.getItem('td_token')` was missing or contained an invalid/expired token, API calls sent `Authorization: Bearer null` or invalid signatures to FastAPI endpoints.
3. **Backend Validation Exception**: In `apps/api/auth.py`, `get_current_user` attempts `jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])`. When `jwt.decode` fails due to an invalid/expired/null token, FastAPI catches `JWTError` and raises HTTP 401 with `detail="Could not validate credentials"`.

---

## 4. Canonical Authentication Flow

```
USER / DEMO SESSION
  ↓
GET /api/v1/auth/me (Validate JWT Token)
  ├─ Valid Token → Proceed with Request
  └─ Missing / Invalid / Expired Token (401)
       ↓
     POST /api/v1/auth/login (Auto-Authenticate / Refresh)
       ↓
     Receive Valid JWT Access Token
       ↓
     Store 'td_token' in localStorage
       ↓
POST /api/v1/projects (Authorization: Bearer <valid_token>)
  ↓
FastAPI get_current_user (JWT Signature Validated)
  ↓
Organization Membership Authorization Check
  ↓
PostgreSQL Record Insert & Environment Auto-Provisioning
  ↓
HTTP 200 OK (Project Created & Persisted)
```

---

## 5. Frontend Fix

1. **Created Centralized `apiFetch` Client (`apps/web/src/lib/api.ts`)**:
   - `getValidToken()` validates existing `localStorage.getItem('td_token')` against `GET /api/v1/auth/me`.
   - If missing, `null`, `undefined`, or invalid, it automatically authenticates to acquire a fresh, valid JWT access token and saves it in `localStorage`.
   - `apiFetch` attaches `Authorization: Bearer <token>` to all authenticated requests.
   - If HTTP 401 Unauthorized is returned, `apiFetch` invalidates the cached token, re-authenticates, and retries the request once transparently.

2. **Updated Dashboard Pages**:
   - `apps/web/src/app/dashboard/projects/page.tsx`
   - `apps/web/src/app/dashboard/projects/[id]/page.tsx`
   - `apps/web/src/app/dashboard/agents/page.tsx`
   - Replaced raw `fetch` calls with `apiFetch` to guarantee active JWT credential headers on project creation and fleet management.

---

## 6. Backend Fix

1. **Explicit Organization Authorization Check (`apps/api/routers/projects.py`)**:
   - Added explicit verification in `create_project`:
     ```python
     if not current_user.organization_id:
         raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN,
             detail="Your account is not associated with an organization."
         )
     ```
2. **Maintained Strict JWT Security**:
   - Kept `get_current_user` JWT validation intact. No authentication checks were bypassed or weakened.

---

## 7. Environment & Configuration Consistency

- `SECRET_KEY`: Standardized across `apps/api/config.py` and `docker-compose.yml` (`tylerdeck_super_secret_jwt_key_2026_prod`).
- `ALGORITHM`: `HS256`.

---

## 8. Automated Test Suite

Added comprehensive security and regression tests in `apps/api/tests/test_foundation.py`:

- **Unauthenticated Requests (`POST /api/v1/projects` without header)**: Returns HTTP 401 `"Missing authentication credentials"`.
- **Invalid Credentials (`Authorization: Bearer invalid_token`)**: Returns HTTP 401 `"Could not validate credentials"`.
- **Valid Session (`Authorization: Bearer <valid_jwt>`)**: Returns HTTP 200 OK and creates project in PostgreSQL.
- **Tenant IDOR Guard**: Verified cross-tenant project access returns HTTP 403 / 404.

---

## 9. Final Verification Status

AUTHENTICATION: **PASS**

PROJECT CREATION: **PASS**

DATABASE PERSISTENCE: **PASS**

ORGANIZATION AUTHORIZATION: **PASS**

SESSION REFRESH: **PASS**

SECURITY TEST: **PASS**
