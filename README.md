# 470-Project-# 🎓 EduStream - Real-Time Collaborative Virtual Study Space

EduStream is a distributed full-stack collaborative learning platform designed to streamline student productivity. The system incorporates real-time study rooms, synchronized group focus timers, and AI-driven study note extraction. 

The architecture is built on a **FastAPI (Python)** REST & WebSocket backend, a **Next.js 14 (React, TypeScript & Tailwind CSS)** frontend, and **Supabase (PostgreSQL)** for persistent and real-time state management.

---

## ⚡ 1-Click Run Guide (No Terminal Commands Required!)

You can run the entire platform directly from your cloned Git folder without typing commands in the terminal:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ZahirulNiloyCodes/470-Project-.git
   ```
2. **Double-Click `run.bat`** (or **`start.bat`**) in Windows File Explorer.
   - It automatically verifies/creates the Python virtual environment.
   - It automatically verifies/installs all dependencies.
   - It automatically launches the **FastAPI backend** (`:8000`) and **Next.js frontend** (`:3000`).
   - It automatically opens **http://localhost:3000/demo** in your default web browser!

3. **To Run All Unit Tests**:
   - Double-click **`run_tests.bat`** to execute all 38 backend and 11 frontend unit tests.

4. **To Stop the App**:
   - Double-click **`stop.bat`** to cleanly shut down both servers.

---

## 📌 Features Breakdown

### 🏛️ Member 1 Modules
* **FR1: Study Room Lifecycle Management** — Dynamic creation, room access validation (public or private with access codes), academic subject tag filtering, and active room listings.
* **FR5: Synchronized Pomodoro Clock** — Real-time bidirectional WebSocket timer synchronization across all connected room participants with host management (`START`, `PAUSE`, `RESET`).
* **FR9: AI-Driven Flashcard Generator** — Automatic extraction and summarization of study notes into structured, interactive double-sided flip cards.
* **FR13: Peer Rating System** — Post-study-session peer helpfulness evaluation, interactive 1–5 star scoring, qualitative feedback remarks, self-rating prevention, and user reputation metrics.

---

## 🏗️ Architectural Layout (MVC Pattern)

```text
470-Project-/
├── backend/
│   ├── config/              # Supabase, Database & LLM singleton clients
│   ├── controllers/         # Business logic & WebSocket broadcaster loops
│   ├── models/              # Supabase database abstractions
│   ├── routers/             # FastAPI endpoint dispatchers & routing
│   ├── schemas/             # Pydantic data schemas & request validation
│   ├── main.py              # Application root, CORS setup & router registration
│   └── requirements.txt     # Python backend dependencies
│
├── frontend/
│   ├── app/
│   │   ├── demo/            # Integrated Member 1 testbed (/demo)
│   │   ├── layout.tsx       # Root Next.js layout & global theme
│   │   └── page.tsx         # Platform entry landing page
│   ├── components/
│   │   ├── flashcards/      # Interactive deck UI & flip-card animations
│   │   ├── pomodoro/        # Real-time WebSocket clock widget
│   │   ├── rooms/           # Study room creation modal & listing
│   │   └── ui/              # Shared high-contrast UI components
│   ├── lib/
│   │   └── utils.ts         # Tailwind & class merge utilities
│   ├── services/            # Client-side API wrappers & WebSocket handlers
│   └── package.json         # Node.js dependencies & scripts
│
├── .gitignore               # Ignored dependencies, virtual environments, and secrets
└── README.md                # Full project documentation and run guide