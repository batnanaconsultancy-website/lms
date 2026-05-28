# CodeForge LMS

A full-stack Learning Management System built with:
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Express.js REST API
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: JWT (access + refresh tokens)
- **Real-time**: Socket.IO (GitHub sync events)
- **Queue**: BullMQ + Redis (webhook processing)

---

## Features

- Student & Instructor roles
- Course creation with modules and lessons
- Video & text lesson content
- Assignments with file/GitHub submissions
- GitHub repo sync (webhooks)
- Progress tracking & grading
- Admin dashboard

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- Redis (local or Upstash)
- Neon PostgreSQL account (free at neon.tech)

### 1. Clone & Install
```bash
git clone https://github.com/your-org/lms.git
cd lms
npm run install:all
```

### 2. Environment Setup
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

Fill in your Neon DATABASE_URL and other secrets (see .env.example files).

### 3. Run Database Migrations
```bash
cd backend
npm run migrate
```

### 4. Seed Demo Data (optional)
```bash
npm run seed
```

### 5. Start Development
```bash
# From root — starts both frontend (:3000) and backend (:4000)
npm run dev
```

---

## Deployment

### Vercel (Frontend)
```bash
cd frontend
npx vercel --prod
```

### Render (Backend)
Push `backend/` to a Render Web Service. Set env vars in Render dashboard.

### Railway (Full Stack)
```bash
railway up
```

---

## Project Structure

```
lms/
├── frontend/          # Next.js 14 app
├── backend/           # Express.js API
├── shared/            # Shared types/constants
├── docker-compose.yml
└── package.json       # Root scripts
```

---

## API Base URL
- Development: `http://localhost:4000/api`
- Production: Set `NEXT_PUBLIC_API_URL` in frontend env
