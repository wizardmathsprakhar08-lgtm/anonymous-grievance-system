# 24/7 "Anytime, Anywhere" Deployment Guide (JanAwaaz AI)

To operate this app **24/7 from anywhere** (on mobile data 4G/5G, outside your home, even when your PC is turned off), two components need to be hosted in the cloud:

---

## ☁️ Step 1: Host the Backend 24/7 (Free on Render.com)

Render provides free 24/7 cloud hosting for FastAPI with zero credit card required.

1. **Push your code to GitHub**:
   - Create a free GitHub repository (e.g. `anonymous-grievance-system`).
   - Push the `backend/` folder to GitHub.

2. **Deploy on Render**:
   - Sign up for free at [render.com](https://render.com).
   - Click **New +** ➔ **Web Service**.
   - Connect your GitHub repository.
   - Set the following settings:
     - **Root Directory**: `backend`
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Click **Deploy Web Service**.

3. **Get Your Permanent Cloud URL**:
   - Render gives you a permanent URL like:
     `https://janawaaz-ai-backend.onrender.com`
   - This URL is live 24/7 worldwide!

---

## 📱 Step 2: Build a Standalone Mobile App (.APK)

Currently, **Expo Go** requires running `npx expo start` on your computer.  
To have an app that **never requires your computer** and stays permanently on your phone:

### Option A: Free Cloud APK Build with EAS (Recommended)
Expo provides free cloud builds that compile an `.apk` file without needing Android Studio:

1. Open terminal in `mobile-expo`:
   ```bash
   cd mobile-expo
   npx eas-cli login
   ```
   *(Create a free account at [expo.dev](https://expo.dev) if you don't have one)*

2. Run the build command:
   ```bash
   npx eas-cli build -p android --profile preview
   ```
3. Expo builds the `.apk` in their cloud (takes ~5 minutes).
4. When finished, it gives you a **direct download link & QR code**.
5. Download and install the `.apk` on your phone.

---

## 🔗 Step 3: Connect Mobile App to Your Cloud Backend

Once you have your Render cloud URL (e.g. `https://janawaaz-ai-backend.onrender.com/api`):
1. In your installed mobile app, go to the **Settings (⚙️ Server)** tab.
2. Enter your Render cloud URL.
3. Tap **Save Server URL**.

🎉 **You can now use JanAwaaz AI anytime, anywhere, on mobile data or Wi-Fi, without your PC!**
