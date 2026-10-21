# JanSeva AI — National Multilingual Scheme Assistant & RAG Portal

An enterprise-ready, production-grade citizen welfare discovery platform designed for India's 1.4 billion citizens. Built with a full-stack architecture combining a robust Express/Node backend, Google Gemini Grounded RAG (Retrieval-Augmented Generation) pipeline, and a responsive React 19 SPA with complete multilingual localization across 10 Indian official languages.

---

## 🏛️ Application Highlights

- **20 Verified Sectors & 200 Schemes**: Exactly 10 Central and State schemes curated per sector with eligibility rules, financial benefits, application steps, and document requirements.
- **Full-App Localization across 10 Languages**: Dynamic instant translation for **Malayalam (മലയാളം)**, **Odia (ଓଡ଼ିଆ)**, **Urdu (اردو)**, **English**, **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, **Bengali (বাংলা)**, **Marathi (मराठी)**, and **Kannada (ಕನ್ನಡ)** across every screen, button, badge, modal, and drawer.
- **Multilingual Virtual Keyboard**: Native on-screen keyboard layouts with native numerals, consonants, matras (vowel signs), viramas/conjuncts, and bidirectional RTL support for Urdu.
- **Multilingual Voice Assistant**: Browser Speech Recognition and SpeechSynthesis tailored to native Indian locale codes (`ml-IN`, `or-IN`, `ur-IN`, `hi-IN`, `ta-IN`, etc.).
- **Production-Ready OTP Gate**: Dual-channel verification (Mobile SMS & Email) with 6-digit auto-advancing input, resend countdown timer, and simulated instant verification mode.
- **Intelligent RAG & Grounded Agent**: Hybrid keyword and vector retriever citing official ministry documents and portals with zero hallucination.

---

## 📂 Codebase & Folder Architecture

The project adheres to strict separation of concerns between backend server services, retrieval engine, internationalization dictionaries, domain types, and modular UI components:

```
├── server.ts                       # Backend Express HTTP & API Server (Node/TypeScript)
├── package.json                    # Full-stack dependency manifest & scripts
├── tsconfig.json                   # Strict TypeScript compiler configuration
├── metadata.json                   # Platform capability & runtime metadata
├── index.html                      # HTML5 entry point with OpenGraph & SEO tags
│
├── src/                            # Frontend Client Application (React 19 + TypeScript)
│   ├── main.tsx                    # React DOM bootstrap & root mounting
│   ├── App.tsx                     # Top-level state coordinator, routing, & modals
│   ├── index.css                   # Global styling with Tailwind CSS
│   │
│   ├── types/
│   │   └── index.ts                # Strict domain interfaces (Scheme, User, Sector, Profile)
│   │
│   ├── data/
│   │   └── schemesData.ts          # Comprehensive 200-scheme database (20 sectors × 10 schemes)
│   │
│   ├── lib/
│   │   ├── i18n.ts                 # Full localization dictionary for 10 languages
│   │   └── rag/
│   │       ├── types.ts            # Knowledge chunk and RAG query interfaces
│   │       └── retriever.ts        # Hybrid vector-BM25 chunk index & retrieval engine
│   │
│   └── components/                 # Modular, Single-Responsibility React Components
│       ├── layout/
│       │   └── Navbar.tsx          # Brand header, language selector, state switcher, & tabs
│       ├── auth/
│       │   └── AuthPortal.tsx      # Secure Mobile & Email OTP authentication screen
│       ├── schemes/
│       │   ├── SchemeCard.tsx      # Scheme preview card with badges & localized titles
│       │   └── SchemeDetailsModal.tsx # Full scheme breakdown (criteria, docs, process)
│       ├── eligibility/
│       │   └── EligibilityWizard.tsx # Multi-step rule evaluation for personalized matching
│       ├── benefits/
│       │   └── BenefitFinder.tsx   # Stacked benefit packages & missed opportunity detection
│       ├── documents/
│       │   └── DocumentChecklist.tsx # Citizen document readiness tracker & issuing links
│       ├── keyboard/
│       │   └── VirtualKeyboard.tsx # 10-language native virtual keyboard with matras & RTL
│       ├── voice/
│       │   └── VoiceAssistantModal.tsx # Interactive speech-to-text & text-to-speech assistant
│       ├── agent/
│       │   └── SchemeAgentDrawer.tsx # Conversational AI drawer with verified citations
│       └── rag/
│           ├── RAGInspectorModal.tsx # Live transparency modal showing retrieved chunks
│           └── RAGAssistant.tsx    # Embedding and similarity scoring utility
```

---

## 🔌 Backend API Specification (`server.ts`)

The Express backend serves both production REST API endpoints and mounts the Vite middleware during local development:

### 1. Authentication Endpoints
- `POST /api/auth/send-otp`
  - Generates a cryptographically secure 6-digit OTP stored in-memory with a 5-minute TTL.
  - Returns masked destination (e.g. `+91 ******3210`) and a demo code for seamless evaluation.
- `POST /api/auth/verify-otp`
  - Validates the 6-digit OTP code against the stored challenge.
  - Issues an authenticated `UserProfile` object with session token and timestamp.

### 2. Schemes & Knowledge Endpoints
- `GET /api/schemes`
  - Query filters: `state`, `sector`, `search`.
  - Searches English and regional language names, descriptions, and tags.
- `POST /api/schemes/check-eligibility`
  - Evaluates a citizen's profile (age, gender, state, income, landholding, BPL status, category).
  - Returns scored matches with specific reasons for qualification and disqualification.

### 3. Grounded RAG Endpoints
- `POST /api/rag/query`
  - Runs hybrid similarity retrieval on `retriever.ts` chunk index.
  - Constructs augmented prompt with explicit citations.
  - Calls Gemini 3.8 Flash server-side (when `GEMINI_API_KEY` is present) or falls back gracefully to a deterministic local grounded answer.
- `GET /api/rag/stats`
  - Provides system statistics (total schemes, total indexed chunks, supported sectors, and states).

---

## 🌐 Complete Multilingual Matrix

| Code | Language | Script | Keyboard Layout | Voice Recognition |
| :--- | :--- | :--- | :---: | :---: |
| `en` | English | Latin | Standard QWERTY | `en-IN` |
| `hi` | हिन्दी (Hindi) | Devanagari | Full vowels, consonants & matras | `hi-IN` |
| `ta` | தமிழ் (Tamil) | Tamil | Native characters & grantha | `ta-IN` |
| `te` | తెలుగు (Telugu) | Telugu | Consonants, vowels & guninthalu | `te-IN` |
| `bn` | বাংলা (Bengali) | Bengali | Vowels, yuktakshara & matras | `bn-IN` |
| `mr` | मराठी (Marathi) | Devanagari | Standard Marathi script | `mr-IN` |
| `kn` | ಕನ್ನಡ (Kannada) | Kannada | Aksharamale with kagunita | `kn-IN` |
| `ml` | മലയാളം (Malayalam) | Malayalam | Swarangal, vyanjanangal & chillu | `ml-IN` |
| `or` | ଓଡ଼ିଆ (Odia) | Odia | Swara, vyanjana & matras | `or-IN` |
| `ur` | اردو (Urdu) | Perso-Arabic | Right-to-Left (RTL) Nastaliq layout | `ur-IN` |

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (version 20.x or higher)
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Starts the Express server with Vite middleware on port 3000:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Verify Types & Code Quality
```bash
npm run lint
```
Executes `tsc --noEmit` with zero type errors.

### 4. Build for Production
```bash
npm run build
```
Generates optimized frontend bundles in `/dist`.

### 5. Start Production Server
```bash
npm run start
```

---

## 🛡️ Coding Standards & Best Practices

1. **Strict React 19 Rules of Hooks**: All hooks (`useState`, `useRef`, `useEffect`) are unconditionally called at the top level of every functional component, eliminating fiber index mismatches and static flag errors.
2. **Type Safety**: No `any` escapes in core domain models. All schemes, profiles, and API responses are typed in `src/types/index.ts`.
3. **Graceful Fallbacks**: If external AI or network calls fail, the platform provides offline deterministic answers and simulated OTP codes for frictionless end-user testing.
