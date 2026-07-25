# Part-Time Job Information Platform for College Students

## Final Year Thesis Documentation

---

## 1. Introduction

### 1.1 Problem Statement
College students struggle to find reliable, flexible part-time jobs that fit their class schedules. Existing job platforms (LinkedIn, Indeed) are geared toward full-time professionals and lack student-specific features like schedule flexibility, short-term durations, and skill-based matching.

### 1.2 Proposed Solution
A dedicated web platform connecting students with local employers offering part-time, flexible positions. Three user roles — Students, Enterprises, and Administrators — each with tailored dashboards and workflows.

### 1.3 Objectives
- Provide a centralized job board for part-time/student-friendly positions
- Enable students to create professional resumes and track applications
- Allow enterprises to post jobs, manage applicants, and schedule interviews
- Give administrators tools to moderate content and verify users
- Support multiple languages for diverse student populations

---

## 2. System Analysis

### 2.1 Use Cases

#### Student Use Cases
| ID | Use Case | Description |
|---|---|---|
| UC-S1 | Register Account | Student creates account with email/password |
| UC-S2 | Manage Profile | Update major, grade, skills, availability |
| UC-S3 | Create Resume | Build resume with experience, skills, certificates |
| UC-S4 | Browse Jobs | Search/filter active job listings |
| UC-S5 | Apply to Job | Submit application with selected resume |
| UC-S6 | Track Applications | View application status and interview dates |
| UC-S7 | Save Jobs | Bookmark jobs for later review |

#### Enterprise Use Cases
| ID | Use Case | Description |
|---|---|---|
| UC-E1 | Register Enterprise | Submit company details for admin approval |
| UC-E2 | Post Job | Create job listing with requirements |
| UC-E3 | Manage Jobs | Activate, pause, edit, or delete postings |
| UC-E4 | Review Applicants | View applications and attached resumes |
| UC-E5 | Update Status | Move application through hiring pipeline |
| UC-E6 | Schedule Interview | Set interview date/time/location |

#### Admin Use Cases
| ID | Use Case | Description |
|---|---|---|
| UC-A1 | Verify Students | Approve student ID verification |
| UC-A2 | Approve Enterprises | Review and approve enterprise registrations |
| UC-A3 | Audit Jobs | Review, approve, or reject job postings |
| UC-A4 | Manage Users | Ban/unban users, view all accounts |
| UC-A5 | Manage Content | Create banners and announcements |

### 2.2 Functional Requirements
- FR1: User registration and authentication (Email/Password)
- FR2: Role-based dashboards (Student, Enterprise, Admin)
- FR3: Resume creation with skills and certificates
- FR4: Job posting with salary, location, skill requirements
- FR5: Application tracking with status pipeline
- FR6: Interview scheduling
- FR7: Admin moderation (student verification, enterprise approval, job audit)
- FR8: Multi-language support (7 languages)
- FR9: Notifications for status changes
- FR10: Search and filter jobs

### 2.3 Non-Functional Requirements
- NFR1: Response time < 500ms for API endpoints
- NFR2: 99.9% uptime (cloud-hosted)
- NFR3: Mobile-responsive design
- NFR4: Secure authentication (JWT + Firebase)
- NFR5: Rate limiting on auth endpoints
- NFR6: RTL support for Arabic

---

## 3. System Design

### 3.1 Architecture
Three-tier web application:

```
┌───────────────┐      REST/JSON      ┌───────────────┐      REST      ┌───────────┐
│  React SPA    │ ◄─────────────────► │  FastAPI      │ ◄────────────► │ Firebase  │
│  (Vite+TS)    │                     │  (Python)     │                │ (Google)  │
└───────────────┘                     └───────────────┘                └───────────┘
   Presentation Tier                   Application Tier                  Data Tier
```

### 3.2 Database Design (Firestore - NoSQL)

**Collections (9 total):**

```
users
├── uid: string (PK)
├── email: string
├── role: 'student' | 'enterprise' | 'admin'
├── displayName: string
├── isActive: boolean

students                    enterprises
├── uid → users.uid         ├── uid → users.uid
├── major: string           ├── companyName: string
├── grade: string           ├── isApproved: boolean
├── skills: array           ├── isBanned: boolean
├── isVerified: boolean     ├── address: string

jobs                        applications
├── id: auto                ├── id: auto
├── enterpriseUid → ent     ├── jobId → jobs.id
├── title: string           ├── studentUid → students
├── status: enum            ├── resumeId → resumes
├── skillRequirements[]     ├── status: enum
├── salary, location        ├── interviewSchedule

resumes                     notifications
├── id: auto                ├── id: auto
├── studentUid → students   ├── userId → users
├── skills: array           ├── type: enum
├── isDefault: boolean      ├── isRead: boolean

announcements               banners
├── id: auto                ├── id: auto
├── type: enum              ├── imageUrl, link
├── isActive, priority      ├── order, isActive
```

### 3.3 Authentication Flow

```
Register:  Client → POST /auth/register → Firebase createUser → Firestore store profile → JWT issued
Login:     Client → POST /auth/login → Firebase signInWithPassword → Firestore fetch profile → JWT issued
Request:   Client → Bearer <JWT> → FastAPI verify → extract role → authorize → handle
```

### 3.4 Application State Machine

```
PENDING → REVIEWING → INTERVIEW → HIRED → COMPLETED
   │                     │
   └─────────────────────┴──→ REJECTED
```

---

## 4. Implementation

### 4.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19 |
| Language | TypeScript | 6.0 |
| Build Tool | Vite | 8.1 |
| CSS Framework | TailwindCSS | 3.3 |
| Backend Framework | FastAPI | 0.104 |
| Language | Python | 3.13 |
| Database | Firebase Firestore | NoSQL |
| Authentication | Firebase Auth | Email/Password |
| Storage | Firebase Storage | — |

### 4.2 Key Libraries

| Library | Purpose |
|---|---|
| react-router-dom v6 | Client-side routing |
| @tanstack/react-query v5 | Server state management |
| i18next + react-i18next | Internationalization (7 langs) |
| react-hook-form + zod | Form validation |
| lucide-react | Icons |
| react-hot-toast | Toast notifications |
| firebase-admin | Server-side Firebase SDK |
| python-jose | JWT encoding/decoding |
| pydantic v2 | Request/response validation |
| slowapi | Rate limiting |
| pytest + vitest | Testing |

### 4.3 API Endpoints (74 total)

| Group | Count | Key Endpoints |
|---|---|---|
| Auth | 9 | register, login, logout, refresh, forgot/reset password, me |
| Students | 6 | profile CRUD, ID verification, application history |
| Resumes | 8 | CRUD, certificates, set default |
| Jobs (Student) | 8 | list, search, detail, apply, check, save, recommended |
| Enterprise | 7 | profile, job CRUD, status, applicants |
| Applications | 5 | list, detail, status update, interview, resume view |
| Admin | 22 | user mgmt, verification, approval, job audit, banners, announcements |
| Notifications | 4 | list, mark read, mark all read, delete |

---

## 5. Testing

### 5.1 Test Summary

| Type | Framework | Tests | Passed |
|---|---|---|---|
| Model Validation | pytest | 10 | 10 |
| Security (JWT) | pytest | 4 | 4 |
| API Integration | pytest | 17 | 17 |
| Component Tests | vitest | 9 | 9 |
| **Total** | | **40** | **40** |

### 5.2 Test Categories

- **Unit Tests**: Pydantic model validation, JWT encode/decode
- **Integration Tests**: API endpoint access control (401/403), validation errors (422), Swagger schema verification
- **Component Tests**: Pagination rendering/callbacks, Skeleton loading states, EmptyState display

### 5.3 User Acceptance Testing Checklist
- [x] Student registration and login
- [x] Enterprise registration and login
- [x] Admin access
- [x] Resume creation and editing
- [x] Job posting by enterprise
- [x] Job browsing by student
- [x] Job application submission
- [x] Application status updates
- [x] Interview scheduling
- [x] Admin verification/approval workflows
- [x] Language switching (all 7 languages)
- [x] Mobile responsive design

---

## 6. Deployment

### 6.1 Deployment Architecture

| Component | Platform | URL |
|---|---|---|
| Frontend | Vercel | [Add URL] |
| Backend | Railway | [Add URL] |
| Database | Firebase (us-central1) | — |

### 6.2 Environment Configuration

Essential environment variables documented in `.env.example` files.

### 6.3 Security Rules

Firebase Security Rules deployed for all 9 collections with role-based access control.

---

## 7. Conclusion

### 7.1 Achievements
- Full-stack web application with 3 user roles
- 74 REST API endpoints
- 9 Firestore collections with security rules
- 7 language support with RTL
- 40 automated tests
- Comprehensive documentation

### 7.2 Future Work
- Android app (planned as separate phase)
- Real-time chat between students and employers
- AI-powered job recommendations
- Payment integration for premium listings
- Advanced analytics dashboard

### 7.3 Lessons Learned
- REST API fallback strategy for networks without HTTP/2
- NoSQL schema design for complex relational queries
- Multi-language i18n architecture
- Rate limiting and security best practices

---

## Appendix

### A. Project Structure
See `README.md` for full directory tree.

### B. API Documentation
Interactive Swagger UI: `http://localhost:8000/docs`

### C. Database Schema
See `ARCHITECTURE.md` for detailed schema and indexes.

### D. Test Results
See `TEST_RESULTS.md` for detailed test output.

### E. User Manual
See `USER_MANUAL.md` for end-user instructions.
