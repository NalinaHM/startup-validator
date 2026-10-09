<h1 align="center">🚀 AI Startup Idea Validator & Government Schemes Advisor</h1>

<p align="center">
  <b>An AI-powered startup intelligence app providing instant VC-grade validation, location market research, Mudra loan guidance, and tailored growth strategies.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 🎯 Problem Statement & Solution

**The Problem**: Aspiring entrepreneurs often lack access to data-driven tools to validate startup concepts, analyze location suitability, and navigate government support programs like Mudra loans. This contributes to high business failure rates and misallocated resources.

**Our Solution**: An AI platform that delivers **VC-grade startup validation in seconds**. It combines location intelligence, personalized guidance for Indian government financial schemes (PM Mudra Yojana, SISFS), tailored marketing campaign strategies, and exportable PDF pitch reports.

---

## ✨ Key Platform Modules

### 📊 1. VC Analysis & Feasibility
- **Market Sizing**: Instant estimation of TAM (Total Addressable Market), SAM, and SOM with actionable market insights.
- **Problem Pain Score**: Qualitative analysis evaluating how acute the targeted problem is.
- **Defensibility & Moat**: Identifies competitive moats (Network Effects, Data Moat, Brand, Tech, Regulatory).
- **Competitor Landscape**: Highlights existing market incumbents, threat levels (Low/Med/High), and key vulnerabilities.
- **Monetization Fit**: Evaluates revenue models (SaaS, Commission, Marketplace, Freemium).
- **VC Perspective**: A 2-sentence frank assessment on fundability and investor readiness.

### 📍 2. Location & Regional Market Intelligence
- **Location Feasibility Score**: 0–100 suitability rating based on target region and demographic fit.
- **Recommended Regions & Hubs**: Pinpoints optimal launch hubs (e.g. Tier 1 Tech Centers vs. Tier 2/3 Industrial Clusters).
- **Supply Chain & Foot Traffic**: Operational insights covering distribution access, foot traffic density, and local infrastructure.
- **Strategic Advantages**: Regional cost benefits, proximity to raw materials, or skilled talent pools.

### 🏛️ 3. Government Support & Mudra Loan Advisor
- **Pradhan Mantri Mudra Yojana (PMMY) Tier Allocation**:
  | Tier | Funding Amount | Best Suited For |
  | :--- | :--- | :--- |
  | 🟢 **Shishu** | Up to ₹50,000 | Micro-vendors & initial seed tools |
  | 🔵 **Kishore** | ₹50,000 to ₹5 Lakhs | Equipment purchase & working capital |
  | 🟡 **Tarun** | ₹5 Lakhs to ₹10 Lakhs | Scaling operations & capital machinery |

- **Startup India & MSME Schemes**: Guidance for Startup India Seed Fund Scheme (SISFS) grants (up to ₹20L) & MSME capital subsidies.
- **Interactive Document Checklist**: Check off required documentation (Udyam Registration, GST, 6-month Bank Statements) directly in the UI.
- **Application Roadmap**: Step-by-step guidance for JanSamarth and DPIIT portal submissions.

### 📣 4. Marketing & Growth Playbook
- **Campaign Slogan Hook**: Punchy marketing slogan tailored to target customer segments.
- **Ideal Customer Persona**: Demographic and behavioral profile of primary buyers.
- **Acquisition Channel Matrix**: Tactical strategies across performance marketing, micro-influencers, and grassroots outreach.
- **Viral Growth Hacks**: Low-cost referral loops and customer acquisition tactics.

### 🖨️ 5. One-Click PDF Pitch Report Export
- Print-optimized CSS formats multi-tab reports into clean, presentation-ready PDF documents for bank loan applications and VC pitches.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, JavaScript (ES6+), Vite 8
- **AI Core**: Google Gemini AI (`gemini-2.5-flash`) via Vite Proxy API
- **Styling**: Modern CSS3 Glassmorphism UI, Responsive Flexbox/Grid, `@media print` rules
- **Deployment**: Vercel

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key ([Get a free key here](https://aistudio.google.com/app/apikey))

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/NalinaHM/startup-validator.git
   cd startup-validator
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GEMINI_MODEL=gemini-2.5-flash
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🏆 Built For
**HackIndia Summer Internship Hackathon 2026**

## 👩‍💻 Author
**Nalina H M**  
🎓 Final Year B.E. Student | 🤖 AI & Machine Learning Enthusiast | 💻 Aspiring Full Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/nalina-h-m-37039837)
[![LeetCode](https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=black)](https://leetcode.com/u/NalinaHM)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NalinaHM)
