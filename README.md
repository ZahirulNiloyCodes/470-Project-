# 470-Project-# 🎓 EduStream - Real-Time Collaborative Virtual Study Space

EduStream is a distributed full-stack collaborative learning platform designed to streamline student productivity. The system incorporates real-time study rooms, synchronized group focus timers, and AI-driven study note extraction. 

The architecture is built on a **FastAPI (Python)** REST & WebSocket backend, a **Next.js 14 (React, TypeScript & Tailwind CSS)** frontend, and **Supabase (PostgreSQL)** for persistent and real-time state management.

---

## 📌 Features Breakdown

### 🏛️ Member 1 Modules
* **FR1: Study Room Lifecycle Management** — Dynamic creation, room access validation (public or private with access codes), academic subject tag filtering, and active room listings.
* **FR5: Synchronized Pomodoro Clock** — Real-time bidirectional WebSocket timer synchronization across all connected room participants with host management (`START`, `PAUSE`, `RESET`).
* **FR9: AI-Driven Flashcard Generator** — Automatic extraction and summarization of study notes into structured, interactive double-sided flip cards.

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