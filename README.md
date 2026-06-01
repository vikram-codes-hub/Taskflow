# 🚀 TaskFlow API

> A production-grade Task Management REST API with Role-Based Access Control, Redis Caching, JWT Authentication, and full Swagger documentation.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-black?style=flat-square&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![Redis](https://img.shields.io/badge/Redis-Cache-red?style=flat-square&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=flat-square&logo=jsonwebtokens)

---

## 📌 Overview

TaskFlow is a scalable REST API built for team task management. Admins can create tasks, assign them to team members with priorities and deadlines, and track progress in real time. Users can view their assigned tasks and update statuses. Built with security, modularity, and scalability in mind.

---

## ✨ Features

### 🔐 Authentication & Security
- User registration with **bcrypt** password hashing (saltRounds: 10)
- JWT-based login with **7-day expiry**
- Role-based access control — `USER` and `ADMIN`
- **Zod** schema validation on all inputs
- Global error handler with consistent error responses
- `.env` based secret management — no hardcoded credentials

### 👑 Admin Capabilities
- View all registered users
- Create tasks and assign them to specific users
- Set task **priority** (`LOW`, `MEDIUM`, `HIGH`) and **due date**
- View all tasks (cached via Redis — 60s TTL)
- Edit and delete any task
- Cache automatically invalidated on every write

### 👤 User Capabilities
- View only their own assigned tasks
- Update task status → `PENDING` → `IN_PROGRESS` → `DONE`

### ⚡ Performance & Observability
- **Redis caching** on admin task list with automatic invalidation
- **Winston** logger — errors written to `logs/error.log`
- **Morgan** HTTP request logger in development
- Structured JSON API responses via response utility wrapper

### 📄 Developer Experience
- Full **Swagger UI** at `/api-docs` — test every endpoint in browser
- **API versioning** at `/api/v1/`
- **Docker Compose** — one command to spin up everything
- **GitHub Actions** CI — lint check on every push
- `.env.example` for easy onboarding

---

## 🗂️ Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Prisma client instance
│   │   │   └── redis.js           # Redis client (Upstash)
│   │   ├── v1/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── task.routes.js
│   │   │   │   └── user.routes.js
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── task.controller.js
│   │   │   │   └── user.controller.js
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   │   ├── role.middleware.js    # Admin guard
│   │   │   │   └── validate.middleware.js # Zod validator
│   │   │   └── schemas/
│   │   │       ├── auth.schema.js
│   │   │       └── task.schema.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── response.js            # Standard response wrapper
│   │   │   └── logger.js              # Winston config
│   │   ├── app.js
│   │   └── server.js
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Axios instance + JWT interceptor
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── components/
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

---

## 🗄️ Database Schema

```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  password      String
  name          String
  role          Role     @default(USER)
  assignedTasks Task[]   @relation("AssignedTasks")
  createdAt     DateTime @default(now())
}

model Task {
  id          Int        @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  assignedTo  Int
  user        User       @relation("AssignedTasks", fields: [assignedTo], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

enum Role       { USER ADMIN }
enum TaskStatus { PENDING IN_PROGRESS DONE }
enum Priority   { LOW MEDIUM HIGH }
```

---

## 📡 API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint    | Access | Description          |
|--------|-------------|--------|----------------------|
| POST   | `/register` | Public | Register new user    |
| POST   | `/login`    | Public | Login, returns JWT   |

### Tasks — `/api/v1/tasks`

| Method | Endpoint      | Access     | Description                        |
|--------|---------------|------------|------------------------------------|
| GET    | `/`           | Admin      | Get all tasks (Redis cached)       |
| POST   | `/`           | Admin      | Create & assign task to a user     |
| PUT    | `/:id`        | Admin      | Edit any task                      |
| DELETE | `/:id`        | Admin      | Delete any task                    |
| GET    | `/my`         | User       | Get own assigned tasks             |
| PATCH  | `/:id/status` | User       | Update task status                 |

### Users — `/api/v1/users`

| Method | Endpoint | Access | Description          |
|--------|----------|--------|----------------------|
| GET    | `/`      | Admin  | Get all users (for assignment dropdown) |

---

## 📦 Standard API Response Format

Every endpoint returns a consistent structure:

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": { }
}
```

Errors follow the same shape with `success: false` and an appropriate HTTP status code.

---

## ⚙️ Environment Variables

Create a `.env` file in `/backend` using `.env.example` as reference:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Redis (Upstash)
REDIS_URL=rediss://your-upstash-redis-url
REDIS_TOKEN=your-upstash-token
```

---

## 🐳 Running with Docker (Recommended)

Make sure Docker Desktop is running.

```bash
# Clone the repo
git clone https://github.com/vikram-codes-hub/taskflow-api.git
cd taskflow-api

# Copy env file
cp backend/.env.example backend/.env
# Fill in your values in backend/.env

# Start everything
docker-compose up --build
```

This spins up:
- **Backend** on `http://localhost:5000`
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`
- **Frontend** on `http://localhost:5173`

---

## 💻 Running Locally (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- Redis running locally (or use Upstash)

### Backend

```bash
cd backend
npm install
cp .env.example .env       # fill in your values

npx prisma generate
npx prisma migrate dev --name init

npm run dev                # starts on :5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                # starts on :5173
```

---

## 📖 API Documentation

Swagger UI is available at:

```
http://localhost:5000/api-docs
```

All endpoints are documented with:
- Request body schema
- Required headers
- Response examples
- Status codes

---

## 🔴 Redis Caching Strategy

| Route              | Cache Key        | TTL   | Invalidated On         |
|--------------------|------------------|-------|------------------------|
| `GET /tasks` (admin) | `admin:tasks`  | 60s   | POST / PUT / DELETE task |

Cache is invalidated immediately on any write operation to ensure data consistency.

---

## 🏗️ Scalability Design

> Written for the assignment's scalability note requirement.

**1. API Versioning** — All routes prefixed with `/api/v1/`. Future breaking changes ship as `/api/v2/` without affecting existing consumers.

**2. Redis Caching** — Frequently read admin data is cached, reducing DB load. TTL + write-through invalidation keeps data fresh.

**3. Modular Architecture** — Routes, controllers, middlewares, and schemas are fully decoupled. Adding a new module (e.g., `projects`, `teams`) requires zero changes to existing code.

**4. Stateless JWT Auth** — No server-side sessions. Any number of backend instances can verify tokens independently — horizontal scaling works out of the box behind a load balancer (e.g., NGINX, AWS ALB).

**5. Docker + Compose** — Containerized services can be independently scaled. Backend can be replicated with `docker-compose scale backend=3`.

**6. Microservices Ready** — Auth, Tasks, and Users are logically separated. Each can be extracted into its own service with its own database when traffic demands it.

**7. Logging** — Winston writes structured logs to file. Can be piped to Datadog, CloudWatch, or ELK stack in production with zero code changes.

---

## 🧪 Running Tests

```bash
cd backend
npm run test
```

---

## 👨‍💻 Author

**Vikram**
- GitHub: [@vikram-codes-hub](https://github.com/vikram-codes-hub)
- Portfolio: [vikram-portfolio-blush.vercel.app](https://vikram-portfolio-blush.vercel.app)
- Registration No: 23FE10ITE00228 | MUJ — B.Tech IT (2027)

---

## 📄 License

MIT License — feel free to use and build on this.