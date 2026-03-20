# Project B - VIERP Attendance & Timetable Terminal

A modern web application for VIT students to monitor attendance, timetable, and academic performance by syncing data from the VIERP portal. Features real-time analysis, AI-powered chat assistance, dashboard views, simulator, and settings with progress tracking.

## 🚀 Quick Start

1. **Backend Setup**:
   ```bash
   # Create & activate virtual environment (recommended)
   python -m venv venv
   venv\Scripts\activate  # On Windows; source venv/bin/activate on Unix

   # Install dependencies
   pip install -r requirements.txt

   # Install Playwright browser
   playwright install chromium

   # Run backend
   python backend/main.py
   ```
Backend runs on `http://localhost:5000`

2. **Frontend Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:8080` (Vite + React + TypeScript + Tailwind)

## 📁 Backend Folder Structure
```
Project-B/
├── requirements.txt          # Python dependencies
└── backend/
    ├── main.py              # Flask API server (core entrypoint)
    ├── connections.py       # VIERP web scraping & parsing logic
    ├── calculator.py        # Attendance analytics & bunk calculator
    └── data/
        └── data.json        # Cached sync history & chat sessions (per-user/IP)
```

**Note**: Frontend directory excluded from structure as per specification.

## 🏗️ System Architecture\n\n![Architecture](https://via.placeholder.com/800x400/1e3a8a/ffffff?text=Project+B+Architecture)\n\n### High-Level Overview

### Core Components

#### 1. **Backend (Flask + Waitress)**
- **Server**: Flask app with CORS enabled, runs on `0.0.0.0:5000` (production-ready with Waitress WSGI).
- **Endpoints**:
  | Endpoint | Method | Purpose | Request Body | Response |
  |----------|--------|---------|--------------|----------|
  | `/api/status` | GET | Sync progress & status (IP-keyed) | - | `{progress, message, is_running}` |
  | `/api/sync` | POST | Fetch & analyze attendance/timetable | `{username, password, year, semester}` | `{success, data: {aggregate, attendance[], timetable{}}}` |
  | `/api/chat` | POST | AI chat (Gemini integration) | `{prompt, context, config: {geminiKey, model}}` | `{reply}` |
- **IP-based Session Management**: Progress tracking per client IP via `sync_status` dict.
- **Error Handling**: Comprehensive try-catch with status callbacks for UI feedback.

#### 2. **Data Scraping & Parsing (connections.py)**
- **Tool**: Playwright Chromium (headless) for stealthy browser automation.
- **Flow**:
  1. Login to `https://learner.vierp.in/login` with VIT email/password.
  2. Navigate to `/attendance` → Select year/sem → "Fetch" → Parse HTML.
  3. Navigate to `/mytimetable` → Select year/sem → "Fetch" → Parse HTML.
- **Parsing**:
  - **Attendance**: BeautifulSoup extracts subject cards → `{name, type, attended, conducted}`.
  - **Timetable**: Table rows → Weekly schedule `{Monday..Saturday: [{time, teacher, subject, type}]}`.
- **Stealth Features**: Custom UA, viewport, anti-detection args (`--disable-blink-features=AutomationControlled`).
- **Status Callbacks**: Real-time progress (0-100%) with messages (e.g., "Loading Attendance Module...").

#### 3. **Analytics Engine (calculator.py)**
- **Core Algorithm**: Per-subject stats with 75% target threshold.
  ```python
  - Critical (<75%): "Attend X more"
  - Borderline (75-80%): "Y bunks left"
  - Safe (>80%): "Z bunks left"
  ```
- **Aggregation**:
  - `analyze_all_subjects()`: Sorts by priority (labs/tutorials first), computes overall %.
  - Output: `{overall_status, aggregate_percentage, defaulter_count, subject_breakdown[]}`.
- **Sorting**: `sort_weight` prioritizes critical labs (1), theory (2), borderline, safe.

#### 4. **Data Persistence (data.json)**
- **Structure**:
  ```json
  {
    "history": [
      {
        "ip": "127.0.0.1",
        "username": "user@vit.edu",
        "timestamp": 1773904201,
        "year": "2025-26",
        "semester": "2",
        "data": { "aggregate": 85.88, "attendance": [...], "timetable": {...} }
      }
    ],
    "chat": { "session_id": "AI response cache" }
  }
  ```
- **Use**: Historical syncs for debugging/offline views.

#### 5. **Frontend Integration (Inferred from Structure)**
- **Views**: DashboardView, TimetableView, AnalysisView, SimulatorView, SettingsView.
- **UI Components**: shadcn/ui (accordion, card, table, etc.), Tailwind, Progress indicators (CircularProgress, SyncOverlay).
- **State**: AppContext for sync status, chat, config (Gemini key/model).
- **Chat**: Powered by Gemini 1.5 Flash (configurable), context-aware for attendance queries.
- **Responsive**: Mobile hooks (use-mobile), BottomNav, Drawer/Sidebar.

#### 6. **External Dependencies**
- **VIERP**: VIT's student portal (attendance/timetable).
- **Gemini API**: Google Generative AI for chat (requires API key in settings).
- **Production**: Waitress for multi-threaded serving (16 threads).

### Data Flow Diagram (Text)
```
User Config (email/pass/year/sem) → /api/sync → Playwright → VIERP → HTML Parse
                                                            ↓
Raw Data → calculator.py → Analyzed Stats → Frontend Dashboard/Analysis
                                                            ↓
Chat Query + Context → /api/chat → Gemini API → AI Reply (e.g., "Critical subjects: ...")
```

## 🔧 Features

- **Live Sync Progress**: Circular spinner with % and messages (e.g., "Waking Engine...", "Analyzing...").
- **Smart Analytics**: Bunk margins, defaulter alerts, lab/theory prioritization.
- **Weekly Timetable**: Teacher/subject/type per slot.
- **AI Assistant**: "B AI" for queries like "Which subjects are critical?".
- **Multi-Semester**: Configurable year/semester selection.
- **History**: Cached syncs per IP/user.
- **Error Resilience**: Fallbacks for parse failures, auth errors.

## 📊 Sample Output

**Attendance Analysis** (Sem 2, 2025-26):
```
Aggregate: 69.94% (CRITICAL)
Defaulters: 7 subjects

Critical:
- ML2309 OS (Theory): 47% → Attend 19 more
- ML2310 POCACD (Lab): 56% → Attend 7 more
```

**Timetable Snippet** (Monday):
```
11:00-12:00: ACA - ML2311 DESIGN THINKING-2 (Tutorial)
14:00-15:00: KBI - HS2004 REASONING AND APTITUDE-4 (Theory)
```

## 🛠️ Development & Troubleshooting

- **Backend Logs**: Check terminal for Flask errors.
- **Scraping Issues**: Verify VIT credentials; portal changes may break selectors.
- **CORS**: Enabled for all origins (`*`).
- **Performance**: Playwright ~30-60s per sync; threaded server handles multiples.
- **Testing**: `curl http://localhost:5000/api/status`.

## Dependencies

**Backend** (requirements.txt)
```
Flask==3.0.3
Flask-CORS==5.0.0
waitress==3.0.0
playwright==1.48.0
beautifulsoup4==4.12.3
requests==2.32.3
```
*Post-install*: `playwright install chromium`

**Frontend**: Node.js, Vite, React 18, TypeScript, Tailwind, shadcn/ui, Vitest/Playwright.
