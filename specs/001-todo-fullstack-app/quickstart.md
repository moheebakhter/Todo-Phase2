# Quickstart Guide: Todo Full-Stack Web Application

**Feature**: 001-todo-fullstack-app
**Date**: 2026-01-30

## Prerequisites

- **Node.js** 20+ and npm/pnpm
- **Python** 3.11+
- **PostgreSQL** (Neon account or local instance)
- **Git**

## Project Setup

### 1. Clone and Navigate

```bash
cd Todo-Phase2
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

Edit `backend/.env`:
```bash
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
JWT_SECRET=your-secure-secret-at-least-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=15
CORS_ORIGINS=http://localhost:3000
```

### 3. Database Setup

```bash
# Run migrations
alembic upgrade head
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
# or
pnpm install

# Copy environment template
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```bash
BETTER_AUTH_SECRET=your-secure-secret-at-least-32-characters-long  # MUST match backend JWT_SECRET
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**IMPORTANT**: `BETTER_AUTH_SECRET` and `JWT_SECRET` must be identical for JWT verification to work.

## Running the Application

### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
uvicorn src.main:app --reload --port 8000
```

Backend available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
# or
pnpm dev
```

Frontend available at: http://localhost:3000

## Verification Steps

### 1. Health Check

```bash
curl http://localhost:8000/api/health
# Expected: {"status":"ok"}
```

### 2. Create Account

1. Open http://localhost:3000
2. Click "Sign Up"
3. Enter email and password
4. Submit form
5. Should redirect to dashboard

### 3. Create Task

1. On dashboard, enter task title
2. Click "Add Task"
3. Task should appear in list

### 4. Toggle Completion

1. Click checkbox next to task
2. Task should show as completed (strikethrough)

### 5. Edit Task

1. Click on task title
2. Modify title or description
3. Click "Save"
4. Changes should persist

### 6. Delete Task

1. Click delete icon on task
2. Confirm deletion
3. Task should be removed

### 7. Verify User Isolation

1. Sign out
2. Create a second account with different email
3. Verify the new account sees no tasks
4. Create tasks for second user
5. Sign out and sign back into first account
6. Verify first account only sees its own tasks

## API Testing (Optional)

### Get JWT Token

After signing in, the JWT is stored in cookies. For API testing, you can extract it from browser DevTools:

1. Open DevTools > Application > Cookies
2. Find the `better-auth.session_token` cookie
3. Use this value in API requests

### Test API Directly

```bash
# List tasks (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/tasks

# Create task
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "description": "From curl"}' \
  http://localhost:8000/api/tasks

# Toggle completion (replace TASK_ID)
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/tasks/TASK_ID/toggle
```

## Troubleshooting

### "Not authenticated" error

- Verify JWT_SECRET matches BETTER_AUTH_SECRET
- Check token is being sent in Authorization header
- Verify token hasn't expired (15 min default)

### CORS errors

- Verify CORS_ORIGINS includes frontend URL
- Check for trailing slashes in URLs

### Database connection errors

- Verify DATABASE_URL is correct
- Check Neon connection limits
- Ensure IP is whitelisted in Neon

### Tasks not appearing

- Check browser console for API errors
- Verify backend is running on port 8000
- Check NEXT_PUBLIC_API_URL is correct

## Development Workflow

1. Make changes to code
2. Backend auto-reloads with `--reload`
3. Frontend hot-reloads automatically
4. Test changes in browser
5. Run governance agents before committing

## Next Steps

After quickstart verification:

1. Run `/sp.tasks` to generate implementation tasks
2. Run `/sp.implement` to execute tasks
3. Invoke governance agents for validation
