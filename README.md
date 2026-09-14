# Anonymous Public Grievance Redressal System Using Multi-Agent AI (JanAwaaz AI)

A full-stack, offline-capable prototype for anonymous public grievance filing, automated classification, severity scoring, duplicate detection, and department routing powered by a 5-agent Python pipeline.

Now equipped with **Mobile App Support (Capacitor Android Native + Installable PWA)**!

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/wizardmathsprakhar08-lgtm/anonymous-grievance-system)

---

## 🚀 Quick Start Guide

### 1. Run Backend Server (FastAPI)
Open a terminal in VS Code:
```bash
cd backend
py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
> Hosting on `0.0.0.0` allows mobile phones and emulators on your local network to connect to your PC's backend API.
> The database (`grievance_system.db`) auto-creates and auto-seeds with municipal departments and demo credentials on first startup.

Backend API documentation: `http://127.0.0.1:8000/docs`

---

### 2. Run Frontend Server (React + Vite)
Open a second terminal in VS Code:
```bash
cd frontend
npm run dev -- --host
```
Open your browser at `http://localhost:5173` to access the application.

---

## 📱 Mobile App Deployment Options

You have two ready-to-use mobile options without rewriting any frontend code:

### Option A: Progressive Web App (PWA) — Instant, Zero Setup
1. On your phone (Android or iPhone connected to the same Wi-Fi), open Chrome or Safari.
2. Navigate to your PC's IP address: `http://<YOUR-PC-IP>:5173` (e.g. `http://192.168.1.5:5173`).
3. Tap the browser menu:
   - **Android Chrome**: Tap **Add to Home screen** or **Install app**.
   - **iOS Safari**: Tap the **Share** button -> **Add to Home Screen**.
4. The app installs with its own icon and opens full-screen like a native app with the mobile bottom navigation bar!

---

### Option B: Capacitor Native Android App (.APK / Play Store)

The full native Android project has been generated and synced inside `frontend/android/`.

#### 1. Open in Android Studio
Run in terminal:
```bash
cd frontend
npx cap open android
```
*(Or open the folder `frontend/android` directly inside Android Studio)*.

#### 2. Run on Android Emulator or Physical Device
- In Android Studio, select your connected device or emulator and press **Run (Green Play Button)**.
- **Emulator Network Note**: In the mobile app, tap the **"Server"** icon on the bottom navigation bar to switch the backend URL:
  - If using Android Studio Emulator: select `http://10.0.2.2:8000/api` (pre-configured).
  - If using a physical phone over Wi-Fi: enter `http://<YOUR-PC-LOCAL-IP>:8000/api`.

#### 3. Build an Installable Standalone `.apk`
To build a debug APK from terminal (requires JDK / Android SDK):
```bash
cd frontend/android
gradlew.bat assembleDebug
```
The generated APK will be located at:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`
You can transfer this `.apk` directly to any Android phone via USB/WhatsApp/Drive to install and test!

#### 4. Updating Web Code in the Mobile App
Whenever you make changes to the React code:
```bash
cd frontend
npm run build
npx cap sync
```

---

## 🔑 Pre-Seeded Demo Credentials

All accounts are created automatically upon first run:

| Role | Username | Password | Assigned Department |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | *All Departments (Full Access)* |
| **Water Officer** | `officer_water` | `officer123` | Water Supply Department |
| **Road Officer** | `officer_road` | `officer123` | Roads & Infrastructure |
| **Elec Officer** | `officer_elec` | `officer123` | Electricity & Power |
| **Sanitation Off** | `officer_sanitation` | `officer123` | Sanitation & Waste Management |
| **Corruption Off** | `officer_corruption` | `officer123` | Anti-Corruption & Governance |

*(Tip: Click any quick-fill credential card on the Login page for 1-click authentication during testing)*

---

## 🤖 Multi-Agent AI Architecture

The system executes a 5-agent synchronous pipeline (`backend/app/agents/pipeline.py`):

1. **IntakeAgent** (`intake.py`):
   - Redacts PII (names, phone numbers, email addresses) via regex algorithms.
   - Generates a SHA-256 tracking ID formatted as `AGY-XXXX-XXXX-XXXX`.
2. **ClassificationAgent** (`classification.py`):
   - Keyword frequency matching against 5 municipal department domains.
3. **UrgencyAgent** (`urgency.py`):
   - Calculates urgency score (0.0 to 1.0) and assigns priority levels (`low`, `medium`, `high`, `critical`) using hazard keywords, punctuation, length, and uppercase ratio.
4. **SimilarityAgent** (`similarity.py`):
   - Computes scikit-learn **TF-IDF + Cosine Similarity** against existing open grievances to detect duplicates and cluster complaints.
5. **RoutingAgent** (`routing.py`):
   - Routes the processed grievance to the appropriate officer queue.

---

## 📡 API Endpoints Summary

- `POST /api/grievances`: Anonymous submission -> multi-agent execution -> tracking ID.
- `GET /api/grievances/{tracking_id}`: Anonymous tracking & resolution timeline lookup.
- `POST /api/auth/login`: Officer & Admin JWT login.
- `GET /api/officer/queue`: Department grievance queue sorted by AI urgency score (JWT protected).
- `PATCH /api/officer/grievances/{id}`: Update grievance status + append to `StatusLog` (JWT protected).
- `GET /api/admin/analytics`: Aggregated dashboard metrics & charts (JWT protected).

---

## 🛠️ VS Code Debugging

Use `.vscode/launch.json` to launch and debug the FastAPI backend using VS Code's built-in debugger.
