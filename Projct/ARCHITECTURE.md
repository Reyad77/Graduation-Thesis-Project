# System Architecture Document

## Overview

The **Part-Time Job Information Platform** is a three-tier web application that connects college students with part-time job opportunities. It features role-based access control for Students, Enterprises, and Administrators.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite + TypeScript + TailwindCSS)         │  │
│  │  • 27 routes                                         │  │
│  │  • React Context (Auth, Language)                     │  │
│  │  • React Query (caching, stale management)            │  │
│  │  • i18next (7 languages, RTL)                         │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┼──────────────────────────────────────┘
                     │ HTTPS/JSON REST API
┌────────────────────┼──────────────────────────────────────┐
│                    │        APPLICATION TIER               │
│  ┌────────────────▼──────────────────────────────────┐   │
│  │  FastAPI Server (Python 3.13)                      │   │
│  │  • 74 REST endpoints                               │   │
│  │  • JWT authentication + Firebase ID token verify   │   │
│  │  • Role-based guards (student/enterprise/admin)    │   │
│  │  • Rate limiting (slowapi)                         │   │
│  │  • Request logging + XSS sanitization              │   │
│  │  • Language detection middleware                   │   │
│  └──────────────────┬─────────────────────────────────┘   │
└────────────────────┼──────────────────────────────────────┘
                     │ REST API calls
┌────────────────────┼──────────────────────────────────────┐
│                    │            DATA TIER                  │
│  ┌────────────────▼─────────────────────────────────┐    │
│  │  Firebase (Google Cloud)                          │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │    │
│  │  │Firestore │ │Firebase  │ │Firebase Storage  │  │    │
│  │  │Database  │ │Auth      │ │(Files/Images)    │  │    │
│  │  │(NoSQL)   │ │(Identity)│ │                  │  │    │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

## Database Schema

### Collections

| Collection | Key Fields | Indexes |
|---|---|---|
| **users** | uid (PK), email, role, isActive, preferredLanguage | — |
| **students** | uid (PK), studentId, major, isVerified, skills[] | isVerified + createdAt |
| **enterprises** | uid (PK), companyName, isApproved, isBanned | isApproved + createdAt |
| **jobs** | id (auto), enterpriseUid, title, status, location, skillRequirements[] | status+postedAt, enterpriseUid+postedAt, status+skillRequirements |
| **applications** | id (auto), jobId, studentUid, resumeId, status | jobId+appliedAt, studentUid+appliedAt, jobId+studentUid |
| **resumes** | id (auto), studentUid, isDefault, skills[] | studentUid+isDefault |
| **notifications** | id (auto), userId, isRead, type | userId+isRead+createdAt |
| **announcements** | id (auto), type, isActive, priority | — |
| **banners** | id (auto), order, isActive | — |

## Authentication Flow

```
1. Registration:
   Client → POST /auth/register (email, password, displayName, role)
        → Firebase Auth REST API (accounts:signUp)
        → Firestore (create user document)
        → JWT issued → returned to client

2. Login:
   Client → POST /auth/login (email, password)
        → Firebase Auth REST API (accounts:signInWithPassword)
        → Verify ID token
        → Fetch Firestore profile
        → JWT issued → returned to client

3. Subsequent requests:
   Client → Authorization: Bearer <JWT>
        → FastAPI dependency verifies JWT
        → Role extracted from payload
        → Endpoint handles request
```

## Role-Based Access Control

| Role | Permissions |
|---|---|
| **student** | Profile CRUD, resume CRUD, browse jobs, apply, view own applications |
| **enterprise** | Profile CRUD, job CRUD, manage job status, view applicants, update application status, schedule interviews |
| **admin** | User management, student verification, enterprise approval, job audit, banner CRUD, announcement CRUD |

## Security Measures

- JWT with HS256 signing (configurable expiry)
- Firebase ID token verification
- Rate limiting: 5/min register, 10/min login
- CORS whitelist
- XSS sanitization (production)
- Request logging
- Firebase Security Rules (client-side)
- File upload validation (type, size)
- Input validation via Pydantic schemas

## Performance Optimizations

- React Query caching (5-min stale time)
- React.lazy() code splitting
- Debounced search inputs
- Pagination (20 items/page)
- React.memo for expensive components
- Vite tree-shaking and code splitting

## i18n Architecture

- **Frontend**: i18next + react-i18next with 7 locale files
- **Backend**: Language middleware (Accept-Language header detection)
- **RTL**: CSS dir="rtl" for Arabic
- **Default**: English (en)

## Technology Decisions

| Decision | Rationale |
|---|---|
| Firebase over PostgreSQL | Free tier, no server management, built-in auth |
| REST over gRPC | Network compatibility (gRPC blocked in some regions) |
| FastAPI over Django | Lightweight, async, auto Swagger docs |
| TypeScript over JavaScript | Type safety, better IDE support |
| Vite over CRA | Faster builds, better DX |
| TailwindCSS | Utility-first, rapid prototyping |
