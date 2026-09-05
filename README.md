# 🎓 EduStream - Real-Time Collaborative Virtual Study Space

EduStream is a distributed full-stack collaborative learning platform designed to streamline student productivity. The system incorporates real-time study rooms, synchronized group focus timers, AI-driven study note extraction, collaborative whiteboards, markdown chat, anonymous Q&A queues, screen sharing, Kanban task boards, study logs, and peer rating reputation metrics.

The architecture is built on a **FastAPI (Python)** REST & WebSocket backend, a **Next.js 14 (React, TypeScript & Tailwind CSS)** frontend, and **Supabase (PostgreSQL)** for persistent and real-time state management.

---

## ⚡ 1-Click Run Guide (No Terminal Commands Required!)

You can run the entire platform directly from your cloned Git folder without typing commands in the terminal:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ZahirulNiloyCodes/470-Project-.git
   cd 470-Project-
   ```
2. **Double-Click `run.bat`** (or **`start.bat`**) in Windows File Explorer.
   - It automatically verifies/creates the Python virtual environment.
   - It automatically verifies/installs all dependencies.
   - It automatically launches the **FastAPI backend** (`:8000`) and **Next.js frontend** (`:3000`).
   - It automatically opens **http://localhost:3000/demo** in your default web browser!

3. **To Run All Unit Tests**:
   - Double-click **`run_tests.bat`** to execute all 180 backend and 72 frontend unit tests (252 tests passing 100%).

4. **To Stop the App**:
   - Double-click **`stop.bat`** to cleanly shut down both servers.

---

## 🛠️ Manual Terminal Run Guide

If you prefer to run services manually via VS Code or terminal:

### Option A: Windows Git Bash (MINGW64)

#### Terminal 1 — Backend:
```bash
cd backend
cp .env.example .env
python -m venv venv
source venv/Scripts/activate
pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

#### Terminal 2 — Frontend:
```bash
cd frontend
cp .env.example .env.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm install
npm run dev
```

---

### Option B: Windows PowerShell

#### Terminal 1 — Backend:
```powershell
cd backend
Copy-Item .env.example .env
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

#### Terminal 2 — Frontend:
```powershell
cd frontend
if (-not (Test-Path .env.local)) { Set-Content -Path .env.local -Value "NEXT_PUBLIC_API_URL=http://localhost:8000" }
npm.cmd install
npm.cmd run dev
```

---

### Option C: macOS / Linux

#### Terminal 1 — Backend:
```bash
cd backend
cp .env.example .env
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

#### Terminal 2 — Frontend:
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm install
npm run dev
```

---

## 🧪 Running Automated Tests (252 Passing Tests)

### Backend Pytest Suite (180 Tests):
```bash
# Windows Git Bash:
cd backend && source venv/Scripts/activate && pytest tests

# Windows PowerShell:
cd backend; .\venv\Scripts\pytest.exe tests
```

### Frontend Vitest Suite (72 Tests):
```bash
# Windows Git Bash:
cd frontend && npm test

# Windows PowerShell:
cd frontend; npm.cmd test
```

---

## 📌 Features Breakdown

### 🏛️ Member 1 Modules
* **FR1: Study Room Lifecycle Management** — Dynamic creation, room access validation (public or private with access codes), academic subject tag filtering, and active room listings.
* **FR5: Synchronized Pomodoro Clock** — Real-time bidirectional WebSocket timer synchronization across all connected room participants with host management (`START`, `PAUSE`, `RESET`).
* **FR9: AI-Driven Flashcard Generator** — Automatic extraction and summarization of study notes into structured, interactive double-sided flip cards.
* **FR13: Peer Rating System** — Post-study-session peer helpfulness evaluation, interactive 1–5 star scoring, qualitative feedback remarks, self-rating prevention, and user reputation metrics.

### 🎨 Member 2 Modules
* **FR2: Collaborative Whiteboard** — Real-time shared canvas powered by `tldraw` and WebSocket delta broadcasting.
* **FR6: Group Chat** — Real-time chat with Markdown formatting, syntax-highlighted code blocks, inline editing, and deletion.
* **FR10: Anonymous Q&A Queue** — Moderated anonymous question submission, queue order calculation, and host answer/dismiss controls.
* **FR14: Screen Sharing** — Low-latency real-time video screen sharing integrated with LiveKit.
* **Authentication & User Management** — Secure registration, bcrypt password hashing, and JWT token authentication.

### 📋 Member 3 Modules
* **FR3: Global Room Search** — Filterable search across active public rooms by keyword and subject tags.
* **FR7: Kanban Task Board** — Room task tracking across Todo, In Progress, and Done stages.
* **FR11: Resource Hub** — Sharing study links and files attached to rooms.
* **FR15: Session Logger** — User study session tracking and logging.

---

## 🏗️ Architectural Layout (MVC Pattern)

```text
470-Project-/
├── backend/
│   ├── config/              # Supabase, Security, LiveKit & LLM clients
│   ├── controllers/         # Business logic & WebSocket broadcaster loops
│   ├── models/              # Supabase database abstractions
│   ├── routers/             # FastAPI endpoint dispatchers & routing
│   ├── schemas/             # Pydantic data schemas & request validation
│   ├── tests/               # 180 Pytest unit & integration tests
│   ├── schema.sql           # Complete Supabase PostgreSQL schema
│   ├── main.py              # Application root, CORS setup & router registration
│   └── requirements.txt     # Python backend dependencies
│
├── frontend/
│   ├── app/
│   │   ├── demo/            # Integrated Member 1 testbed (/demo)
│   │   ├── rooms/[roomId]/  # Unified room view (/rooms/[roomId])
│   │   ├── layout.tsx       # Root Next.js layout & global theme
│   │   └── page.tsx         # Platform entry landing page
│   ├── components/          # React components for Member 1, 2, & 3
│   ├── services/            # Client-side API wrappers & WebSocket handlers
│   ├── tests/               # 72 Vitest unit & integration tests
│   └── package.json         # Node.js dependencies & scripts
│
├── run.bat                  # 1-Click Windows Launcher
├── run_tests.bat            # 1-Click Full Test Runner
├── stop.bat                 # Clean server shutdown
└── server_setup_guide.html  # Standalone interactive setup guide
