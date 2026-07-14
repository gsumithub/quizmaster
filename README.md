# QuizMaster: Full-Stack MERN Quiz Platform

A high-performance, responsive online quiz platform split into separate candidate and administrator portals. Built using the MERN stack with Tailwind CSS v4 and dynamic theme toggling (Light/Dark mode).

---

## 🚀 Key Features

*   **🎓 Candidate Portal (`client/`)**:
    *   Responsive Landing page and User Dashboard.
    *   Browse and filter active quizzes by category and difficulty.
    *   Live countdown timer for quiz execution.
    *   Instant grading, score reports, and detailed explanations of correct answers.
    *   Dynamic theme selector (Light / Dark mode) with local persistence.
*   **⚙️ Administrative Panel (`admin/`)**:
    *   Complete CRUD operations for categories, quizzes, and questions.
    *   One-click activate/deactivate toggles to control quiz visibility.
    *   User Quiz Attempt logs with pass/fail metrics.
*   **🔒 Secure Backend Server (`server/`)**:
    *   MongoDB Atlas integration with isolated database namespace.
    *   JWT stateless authentication with state checks.
    *   Startup hook that automatically seeds the primary administrator account.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), React Router, Axios, Lucide Icons, Tailwind CSS v4
*   **Backend**: Node.js, Express.js, Mongoose (MongoDB ODM)
*   **Database**: MongoDB Atlas (Cloud)
*   **Deployment**: Vercel (Serverless Functions & Static Web App hosting)

---

## 📂 Project Architecture

```text
quizmaster/
├── server/      # Node.js Express backend API (Port 5000)
├── client/      # Candidate portal web application (Port 5173)
└── admin/       # Administrator panel workspace (Port 5174)
```

---

## 💻 Local Setup & Execution

### 1. Backend Server
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `server/` using the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ADMIN_EMAIL=your_admin_email
   ADMIN_PASSWORD=your_admin_password
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

### 2. Candidate Portal
1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the candidate application:
   ```bash
   npm run dev
   ```
   *Runs at `http://localhost:5173`.*

### 3. Administrative Portal
1. Navigate to the `admin/` directory:
   ```bash
   cd ../admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the admin application:
   ```bash
   npm run dev
   ```
   *Runs at `http://localhost:5174`.*

---

## ☁️ Cloud Deployment (Vercel)

For step-by-step instructions on deploying the server (Serverless Node), client, and admin applications globally, please refer to the deployment guides or configure the `vercel.json` routing blocks inside the directory folders.
