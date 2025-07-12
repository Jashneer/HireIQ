# 💼 HireIQ – AI-Powered Recruitment Platform

HireIQ is an intelligent recruiter co-pilot built for modern hiring teams. It analyzes resumes, matches candidates to job roles, and crafts personalized outreach — all driven by GPT-4 and a streamlined UI.

---

## 🚀 Live Preview

Coming soon: Deployment on [Railway](https://railway.app) – stay tuned for the public link.

---

## 🧠 Core Features

### 🔐 Authentication System
- Secure registration and login using email/password
- JWT-based authentication with auto-refresh
- Protected routes and session-aware middleware

### 🤖 AI Analysis Engine
- **Resume Parsing** – extracts and evaluates candidate skills
- **Job Matching** – scores alignment across multiple dimensions:
  - Technical Skills (0–100%)
  - Experience Level (0–100%)
  - Domain Relevance (0–100%)
  - Overall Match Score
- **Skill Gap Analysis** – highlights strengths & gaps
- **Smart Messaging** – GPT-4 generates tailored outreach
- **Candidate Feedback** – actionable improvement tips

### 💼 User Dashboard
- Personalized greeting and usage summary
- Analytics cards showing analysis history and engagement
- Robust input form with:
  - Job description
  - Candidate resume
  - Outreach tone presets (Professional, Casual, Enthusiastic, Direct)
- Sample data loader for quick testing
- Visual results with score breakdown and skill badges
- Persistent history tracking

### 📊 Subscription & Usage Management
- Tiered plans:
  - Free: 3 analyses/day
  - Starter: 50 analyses/month ($29/mo)
  - Pro: Unlimited ($99/mo)
- Usage tracking with resets
- Modal-driven upgrade flow

### 🎨 Modern UI/UX
- Responsive design for all devices
- Clean professional theme with custom palette
- Interactive features:
  - Copy-to-clipboard buttons
  - Animated progress bars
  - Color-coded skill tags
  - Dark mode-ready via CSS variables

---

## 🔧 Technical Stack

| Layer      | Tech                             |
|------------|----------------------------------|
| Frontend   | React 18, TypeScript, Tailwind CSS |
| Backend    | Express.js, TypeScript           |
| Database   | PostgreSQL with Drizzle ORM      |
| AI Engine  | GPT-4 via OpenAI API             |
| Payments   | Stripe integration (UI ready)    |
| File Upload| PDF resume (UI ready)            |

---

## 📈 Business Features

- User behavior tracking via dashboard analytics
- Stripe-powered subscription (activation-ready)
- Scalable infrastructure via Railway
- SEO-optimized layout and metadata

---

## 🧪 What's Working Right Now

✅ User registration & login  
✅ Authenticated dashboard with stats  
✅ Resume analysis engine + match scoring  
✅ History tracking and usage counters  
✅ OpenAI and PostgreSQL integration  
✅ Settings page now active (`/settings`)  

You can start testing real resumes and job descriptions immediately!

---

## 🧭 Planned Improvements

- Profile customization and account settings  
- Notifications and alert management  
- Stripe live activation and billing UX  
- Resume file parsing backend  
- Job board integration

---

## ⚙️ Development Setup

```bash
# Clone the repo
git clone https://github.com/your-username/hireiq.git

# Install dependencies
npm install

# Start the server
npm run dev
