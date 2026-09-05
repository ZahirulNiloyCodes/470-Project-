# 🎓 EduStream - Real-Time Collaborative Virtual Study Space

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tests Passing](https://img.shields.io/badge/Tests-252%20Passed%20(100%25)-success.svg)](backend/tests)

**EduStream** is a distributed, full-stack collaborative learning platform designed to streamline student productivity and peer collaboration. All features across **Member 1**, **Member 2**, and **Member 3** are integrated into a single unified workspace.

The architecture is powered by a **FastAPI (Python)** REST & WebSocket backend, a **Next.js 14 (React, TypeScript & Tailwind CSS)** frontend, and **Supabase (PostgreSQL)** with resilient in-memory fallback stores for 100% offline capability.

---

## ⚡ 1-Click Run Guide (No Terminal Commands Required!)

You can run the entire platform directly from your cloned Git repository without typing commands into a terminal:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ZahirulNiloyCodes/470-Project-.git
   cd 470-Project-
   ```

2. **Double-Click `run.bat`** (or **`start.bat`**) in Windows File Explorer:
   - Automatically detects and verifies Python and Node.js.
   - Automatically sets up `backend\.env` and `frontend\.env.local` configurations.
   - Automatically initializes the Python virtual environment and installs backend dependencies.
   - Automatically installs frontend packages if missing.
   - Launches both the **FastAPI backend** (`:8000`) and **Next.js frontend** (`:3000`).
   - Automatically opens the **EduStream Platform Portal** in your default web browser at **`http://localhost:3000`**!

3. **To Run All Automated Unit Tests**:
   - Double-click **`run_tests.bat`** to execute all 180 backend and 72 frontend tests (**252 tests passing 100%**).

4. **To Stop All Services**:
   - Double-click **`stop.bat`** to cleanly terminate background servers.

---

## 💻 Manual Terminal Run Guide (VS Code Step-by-Step)

If you are working inside VS Code or prefer running each service manually, open two terminal windows in the project root (`470-Project-`):

### Terminal 1: Backend Server (FastAPI)

#### Windows PowerShell:
```powershell
# 1. Enter the backend directory
cd backend

# 2. Setup configuration from template
if (-not (Test-Path .env)) { Copy-Item .env.example .env }

# 3. Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 4. Install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. Launch the FastAPI server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Windows Git Bash / macOS / Linux:
```bash
# 1. Enter the backend directory
cd backend

# 2. Setup configuration from template
cp -n .env.example .env 2>/dev/null || cp .env.example .env

# 3. Create and activate Python virtual environment
python3 -m venv venv || python -m venv venv
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate

# 4. Install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. Launch the FastAPI server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> **Verification:** Open **`http://localhost:8000/docs`** in your browser to view the interactive FastAPI Swagger API documentation.

---

### Terminal 2: Frontend Server (Next.js 14)

#### Windows PowerShell:
> 💡 *Note: On Windows PowerShell, use `npm.cmd` instead of `npm` if your system has PowerShell script execution restrictions.*
```powershell
# 1. Enter the frontend directory
cd frontend

# 2. Setup environment configuration
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }

# 3. Install packages
npm.cmd install

# 4. Start the Next.js development server
npm.cmd run dev
```

#### Windows Git Bash / macOS / Linux:
```bash
# 1. Enter the frontend directory
cd frontend

# 2. Setup environment configuration
cp -n .env.example .env.local 2>/dev/null || cp .env.example .env.local

# 3. Install packages
npm install

# 4. Start the Next.js development server
npm run dev
```

> **Verification:** Open **`http://localhost:3000`** in your web browser.

---

## 🧭 Navigation Guide — Where to Access Each Teammate's Features

| Page / Route | Description | Included Features |
| :--- | :--- | :--- |
| **`http://localhost:3000`** | **EduStream Main Portal** | Overview of all 3 teammates' features, quick room launch, and complete FR1–FR15 link matrix. |
| **`http://localhost:3000/demo`** | **Interactive Testing Hub** | Tabbed workspace to test **Member 1**, **Member 2**, or **Member 3** features directly. |
| **`http://localhost:3000/rooms/room-1`** | **Unified Collaborative Room** | Real-time synchronized room uniting Pomodoro, Whiteboard, Chat, Anonymous Q&A, Screen Share, Kanban, and Resources. |
| **`http://localhost:3000/rooms/room-1/canvas`** | **Collaborative Whiteboard** | Member 2 real-time canvas drawing with shapes, colors, and live stroke synchronization. |
| **`http://localhost:3000/rooms/room-1/chat`** | **Live Group Chat** | Member 2 WebSocket chat with formatted text, timestamps, and active user indicators. |
| **`http://localhost:3000/rooms/room-1/qna`** | **Anonymous Q&A Queue** | Member 2 anonymous questions, participant upvoting, and host resolve controls. |
| **`http://localhost:3000/rooms/room-1/screenshare`** | **Screen Share** | Member 2 screen streaming to connected room participants. |
| **`http://localhost:3000/login`** | **Authentication Login** | Member 2 user login with bcrypt authentication & JWT tokens. |
| **`http://localhost:3000/register`** | **User Registration** | Member 2 account registration with password hashing. |
| **`http://localhost:3000/dashboard`** | **User Profile Dashboard** | Member 2 user profile metrics, rooms list, and session overview. |
| **`http://localhost:8000/docs`** | **Swagger API Explorer** | Interactive FastAPI backend Swagger documentation. |

---

## 📌 Complete Features Breakdown (FR1 – FR15)

### 🏛️ Member 1 Feature Suite
* **FR1: Study Rooms Lifecycle Management** — Dynamic creation, room access validation (public or private with passcodes), subject tag filtering, and room directory.
* **FR5: Synchronized Pomodoro Clock** — Real-time bidirectional WebSocket timer synchronization across all connected participants with host controls (`START`, `PAUSE`, `RESET`). Automatically prompts peer rating on completion.
* **FR9: AI Flashcard Generator** — Automatic extraction and summarization of study notes into structured, interactive double-sided flip cards via LLM integration.
* **FR13: Peer Rating System** — Post-study-session peer helpfulness evaluation, 1–5 helpfulness scale, qualitative feedback notes, strict self-rating prevention, and live aggregated reputation scorecards.

### 🎨 Member 2 Feature Suite
* **FR2: Real-time Whiteboard Canvas** — Multi-user shared canvas with pen tools, shapes, color selection, and WebSocket stroke synchronization.
* **FR6: Group Chat** — Real-time WebSocket messaging with markdown support, author labels, and timestamps.
* **FR10: Anonymous Q&A Queue** — Moderated question submission with anonymous privacy, real-time upvoting, and host resolution.
* **FR14: Screen Sharing** — Low-latency screen and application window streaming to study room participants.
* **Authentication & User Management** — Secure user registration, bcrypt password hashing, JWT token authentication, and user profile dashboards.

### 📋 Member 3 Feature Suite
* **FR3: Global Room Search** — Instant keyword query search and subject tag filtering with direct room entry.
* **FR7: Kanban Task Management Board** — Room task tracking across *To-Do*, *In Progress*, and *Done* states with optimistic local updates.
* **FR11: Room Resource & Document Hub** — Upload and access study links, slides, and PDF documents per room.
* **FR15: Study Session Time Logger & History** — Timer tracking of study duration with pause/resume, study history recording, and aggregated study minutes.

---

## 🧪 Running Automated Unit Tests (252 Tests Passing 100%)

### 1-Click Test Runner (Windows):
Simply double-click **`run_tests.bat`** in Windows File Explorer.

### Manual Terminal Commands:

#### Backend Pytest Suite (180 Tests):
```powershell
# Windows PowerShell:
cd backend
.\venv\Scripts\pytest.exe tests

# Windows Git Bash / macOS / Linux:
cd backend && pytest tests
```

#### Frontend Vitest Suite (72 Tests):
```powershell
# Windows PowerShell:
cd frontend
npm.cmd test

# Windows Git Bash / macOS / Linux:
cd frontend && npm test
```

---

## 🏗️ Architectural Layout (MVC Pattern)

```text
470-Project-/
├── backend/
│   ├── config/              # Supabase, Security & LiveKit client configurations
│   ├── controllers/         # Business logic & WebSocket broadcasting loops
│   ├── models/              # Database models & in-memory offline fallbacks
│   ├── routers/             # FastAPI endpoint dispatchers & route handlers
│   ├── schemas/             # Pydantic data schemas & request validation
│   ├── tests/               # 180 Pytest unit & integration tests
│   ├── schema.sql           # Complete Supabase PostgreSQL table definitions
│   ├── main.py              # Application entrypoint, CORS setup & router registration
│   └── requirements.txt     # Python backend dependencies
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Platform entry portal with all teammate features
│   │   ├── demo/page.tsx    # Interactive testbed with Member 1, 2, and 3 tabs
│   │   ├── rooms/[roomId]/  # Unified room view with real-time tool tabs
│   │   ├── login/page.tsx   # Member 2 login
│   │   ├── register/page.tsx# Member 2 registration
│   │   └── dashboard/page.tsx# Member 2 user dashboard
│   ├── components/          # React components for Member 1, Member 2, & Member 3
│   ├── services/            # Client-side API wrappers & WebSocket handlers
│   ├── tests/               # 72 Vitest unit & integration tests
│   └── package.json         # Node.js dependencies & scripts
│
├── run.bat                  # 1-Click Windows Launcher (Starts all services)
├── run.sh                   # 1-Click macOS/Linux Launcher
├── run_tests.bat            # 1-Click Full Automated Test Suite (252 tests)
├── stop.bat                 # Clean server shutdown script
└── server_setup_guide.html  # Standalone interactive setup guide
```

---

## 🛠️ Database Setup (Optional — For Live Supabase Cloud Sync)

The platform includes **built-in mock fallbacks** for all features, so it runs **100% offline out-of-the-box** without any cloud credentials!

If you wish to link a live Supabase PostgreSQL database:
1. Create a project at [supabase.com](https://supabase.com/).
2. Open the **SQL Editor** &rarr; **New Query**.
3. Paste the contents of [`backend/schema.sql`](backend/schema.sql) and click **Run**.
4. Set your `SUPABASE_URL` and `SUPABASE_KEY` inside `backend/.env` and `frontend/.env.local`.

---

## ❓ Frequently Asked Questions & Troubleshooting

### Q: PowerShell shows "running scripts is disabled on this system"
**A:** On Windows PowerShell, execute commands using `npm.cmd` instead of `npm`, e.g., `npm.cmd run dev`. Alternatively, run PowerShell as Administrator and enable script execution:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Q: Port 8000 or 3000 is already in use
**A:** Double-click **`stop.bat`** to terminate any lingering instances of Python/uvicorn or Node.js. Alternatively:
```powershell
# Stop backend port 8000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force -ErrorAction SilentlyContinue

# Stop frontend port 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force -ErrorAction SilentlyContinue
```

### Q: Does the app work without an OpenAI API key?
**A:** Yes! The AI Flashcard generator includes an automatic fallback generator that creates structured question/answer cards even without an external API key.

---

<p align="center">
  EduStream Collaborative Virtual Study Space &copy; 2026<br>
  <strong>CSE470 Team Project</strong>
</p>

