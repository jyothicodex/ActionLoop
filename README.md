<div align="center">
  <img src="https://img.shields.io/badge/Google_AI-Powered-4285F4?style=for-the-badge&logo=google" alt="Google AI Powered"/>
  <img src="https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-latest-646CFF.svg?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28.svg?style=for-the-badge&logo=firebase" alt="Firebase" />
  
  <br/>
  
  <h1>🚀 ActionLoop</h1>
  <p><strong>A hyper-vibrant, Agentic AI productivity suite built to keep you in the flow.</strong></p>
  <p><i>Submission for the Vibe2Ship / Hackathon</i></p>
</div>

---
## Demo
action-loop-umber.vercel.app

## 🌟 The Vision

Modern productivity apps are inherently passive—they act as digital filing cabinets for tasks, relying entirely on the user's discipline to organize, prioritize, and execute. When a user is overwhelmed or struggling with executive dysfunction, a standard to-do list only adds to their cognitive load. 

**ActionLoop is different.** It is an **Agentic Productivity System** that actively manages you. It seamlessly blends high-end aesthetics (the "vibe") with powerful, autonomous AI features driven by Google AI Studio. ActionLoop goes beyond standard wrapper apps by utilizing an AI that doesn't just chat with you, but acts on your behalf—creating tasks, structuring your time, and managing your database directly.

---

## 🧠 Deep Tech Integration: How We Used Gemini

ActionLoop leverages the `@google/genai` SDK to implement advanced **Function Calling (Tools)**, turning Gemini from a conversational bot into an autonomous agent.

* **Agentic Task Management:** When a user gives an unstructured command (e.g., *"I have 6 hours, plan my day around studying for my math exam and getting a workout in"*), Gemini processes the constraints.
* **Tool Calling in Action:** Instead of just returning text advice, the Gemini model invokes our custom `addMultipleTasks` tool. It constructs a highly structured JSON array of optimized tasks.
* **Direct Database Execution:** The application catches this function call and automatically pushes the AI-generated tasks directly to the user's live Firebase Firestore database. The user's Kanban board instantly populates with the AI's plan.

---

## 🔥 Core Features

### 🤖 The Autonomous AI Coach
A persistent, conversational agent explicitly prompted to help users regain focus. It utilizes **"Micro-Stepping"**—if a user admits to procrastinating, the AI breaks their current task into hyper-specific, 5-minute actionable chunks to bypass executive dysfunction.

### ✨ Magic Goal Breakdown
Users can input intimidating, long-term goals. By clicking **"Magic Breakdown,"** Gemini instantly analyzes the objective and generates a structured timeline of high-level milestones, transforming a daunting dream into an actionable roadmap.

### 📋 Dynamic Kanban Board
A fully functional, drag-and-drop workspace that syncs in real-time with the Firebase backend and the AI Coach's generated tasks.

### 🍅 Integrated Focus Mode
A built-in Pomodoro-style timer that syncs directly with the user's active tasks, ensuring they stay locked in on the priorities the AI helped them set.

---

## 💻 Tech Stack

- **Frontend Core:** React 19, Vite, Vanilla CSS
- **AI / LLM Orchestration:** Google AI Studio (`@google/genai` SDK)
- **Animations / Graphics:** Framer Motion, Three.js, React Three Fiber (Glassmorphism UI)
- **Backend Infrastructure:** Firebase (Authentication & Firestore NoSQL)
- **Deployment & Hosting:** Vercel

---

## 📁 Project Structure

```text
ActionLoop/
├── src/
│   ├── ai/                # Gemini API integration & Tool Declarations
│   ├── assets/            # Static assets, fonts, and images
│   ├── components/        # Reusable React components (UI, Kanban, Timer)
│   ├── firebase/          # Firebase config and Firestore helper functions
│   ├── pages/             # Main application views (Dashboard, Board, Settings)
│   ├── App.jsx            # Main application router and state provider
│   ├── index.css          # Global CSS (Vanilla CSS & Glassmorphism styles)
│   └── main.jsx           # React DOM entry point
├── public/                # Public assets
├── dist/                  # Production build output
├── Dockerfile             # Container configuration for Cloud Run
├── firebase.json          # Firebase Hosting configuration
├── .firebaserc            # Firebase project target
├── package.json           # Project dependencies and scripts
└── vite.config.js         # Vite bundler configuration
```

---

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jyothicodex/ActionLoop.git
   cd ActionLoop/ActionLoop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

---
<div align="center">
  <i>Built with ❤️ for the Hackathon</i>
</div>
