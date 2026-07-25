# Part-Time Job Information Platform for College Students

A full-stack web application connecting students with part-time job opportunities. Final year thesis project.

**Live Demo**: _[Add your deployed URL]_

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Shadcn/UI |
| **Backend** | FastAPI (Python 3.13), Firebase Admin SDK |
| **Database** | Firebase Firestore (NoSQL) |
| **Auth** | Firebase Authentication (Email/Password) |
| **Storage** | Firebase Storage |
| **State** | React Context API + React Query (TanStack) |
| **i18n** | 7 languages (EN, ZH, BN, HI, AR, NL, FR) with RTL |

## Features

### Three User Roles

| Role | Capabilities |
|---|---|
| **Student** | Register, profile management, resume CRUD, browse/search jobs, apply to jobs, track applications, save jobs |
| **Enterprise** | Register with business details, post jobs, manage job listings, review applicants, schedule interviews, update application status |
| **Admin** | Dashboard with stats, user management, student verification, enterprise approval, job audit (approve/reject), banner & announcement management |

### Key Features
- 🌐 Multi-language (7 languages) with RTL support
- 🔐 JWT authentication + Firebase Auth
- 📱 Fully responsive design
- 📄 Resume builder with certificates
- 🔍 Job search with filters
- 📊 Dashboards for all roles
- 🔔 Real-time notifications
- 📧 Password reset via email
- 🛡️ Rate limiting on auth endpoints

## Project Structure

```
Projct/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/v1/endpoints/ # Route handlers (auth, students, jobs, etc.)
│   │   ├── core/             # Config, Firebase, Security, Dependencies
│   │   ├── i18n/             # Backend language middleware
│   │   ├── middleware/       # Logging, XSS sanitization
│   │   ├── models/           # Pydantic schemas
│   │   ├── services/         # Business logic + Firestore CRUD
│   │   ├── utils/            # Helpers & validators
│   │   └── main.py           # FastAPI entry point
│   ├── tests/                # pytest test suite
│   ├── seed_data.py          # Test data seeder
│   ├── setup_firebase.py     # Firebase auto-config
│   ├── Procfile              # Heroku/Railway deploy
│   └── requirements.txt
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (student, enterprise, admin)
│   │   ├── services/         # API service layer
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # AuthContext, LanguageContext
│   │   ├── i18n/locales/     # 7 language translation files
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Constants, validators
│   └── vite.config.ts
├── firebase.json             # Firebase project config
├── firestore.rules           # Firestore security rules
└── storage.rules             # Storage security rules
```

## Getting Started

### Prerequisites
- Python 3.10+ and Node.js 18+
- A Firebase project with Firestore, Auth, and Storage enabled
- Firebase service account JSON key

### 1. Firebase Setup
1. Create a project at https://console.firebase.google.com
2. Enable **Firestore Database**, **Authentication** (Email/Password), and **Storage**
3. Generate a service account key: Project Settings → Service Accounts → Generate new private key
4. Get your Web API Key: Project Settings → General → Web API Key
5. Place the JSON key in a `firebase private key/` folder at project root

### 2. Backend Setup
```bash
cd Projct/backend

# Install dependencies
pip install -r requirements.txt

# Auto-configure Firebase from your JSON key
python setup_firebase.py

# Seed test data
python seed_data.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd Projct/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173

### 4. Test Credentials (after seeding)
| Role | Email | Password |
|---|---|---|
| Student | alice@university.edu | _(uses Firebase Auth)_ |
| Enterprise | hr@techcorp.com | _(uses Firebase Auth)_ |
| Admin | admin@platform.com | _(uses Firebase Auth)_ |

_Note: Seed data users don't have Firebase Auth accounts. Register a new user to test the full flow._

## API Documentation

Full Swagger UI: http://localhost:8000/docs

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login |
| GET | `/api/v1/auth/me` | Yes | Current user profile |
| GET | `/api/v1/jobs/` | No | List active jobs |
| GET | `/api/v1/jobs/{id}` | No | Job details |
| POST | `/api/v1/jobs/{id}/apply` | Student | Apply to job |
| GET | `/api/v1/students/profile` | Student | Student profile |
| GET | `/api/v1/enterprise/jobs` | Enterprise | Manage jobs |
| GET | `/api/v1/admin/users` | Admin | User management |

## Deployment

### Frontend (Vercel)
```bash
cd Projct/frontend
npm run build
# Deploy the dist/ folder to Vercel
# vercel.json is pre-configured for SPA routing
```

### Backend (Railway / Render)
```bash
# Procfile is pre-configured:
# web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Environment Variables

See `.env.example` files in both `backend/` and `frontend/` directories.

### Firebase Security Rules
Deploy rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

## Testing

### Backend (31 tests)
```bash
cd Projct/backend
python -m pytest tests/ -v
```

### Frontend (9 tests)
```bash
cd Projct/frontend
npx vitest run
```

## Architecture

```
┌──────────────┐     REST API      ┌──────────────┐
│   Frontend   │ ◄──────────────► │   Backend    │
│  React + TS  │    HTTPS/JSON    │   FastAPI    │
│  (Vercel)    │                   │  (Railway)  │
└──────────────┘                   └──────┬───────┘
                                          │
                              ┌───────────┼───────────┐
                              │           │           │
                         ┌────▼──┐  ┌────▼──┐  ┌────▼──┐
                         │ Auth  │  │ Store │  │Storage│
                         │(REST) │  │(REST) │  │(REST) │
                         └───────┘  └───────┘  └───────┘
                              └───────────┬───────────┘
                                          │
                                   ┌─────▼─────┐
                                   │ Firebase  │
                                   │ (Google) │
                                   └───────────┘
```

## License

This project is created as a final year thesis. All rights reserved.

## Author

_[Your Name]_ — Final Year Thesis Project
