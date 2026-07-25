# Part-Time Job Information Platform — Backend

FastAPI backend for the Part-Time Job Information Platform.

## Tech Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication (Admin SDK)
- **Storage**: Firebase Storage
- **Validation**: Pydantic v2

## Project Structure
```
backend/
├── app/
│   ├── api/v1/endpoints/   # Route handlers
│   ├── core/               # Config, Firebase, Security, Dependencies
│   ├── models/             # Pydantic schemas
│   ├── services/           # Business logic layer
│   └── utils/              # Helpers & validators
├── tests/                  # Test suite
├── .env                    # Environment variables
└── requirements.txt        # Python dependencies
```

## Getting Started

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # or: source venv/bin/activate  # macOS/Linux
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables in `.env`

4. Start the server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. API docs: http://localhost:8000/docs
