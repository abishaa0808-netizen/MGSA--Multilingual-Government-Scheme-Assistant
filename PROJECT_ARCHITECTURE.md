# MGSA - Multilingual Government Scheme Assistant
## Architecture, Code Structure & Technical Specification

> **Application Name:** MGSA - Multilingual Government Scheme Assistant  
> **Target Audience:** Indian Citizens across 36 States/UTs seeking verified Central & State Government Welfare Schemes  
> **Supported Languages:** 10 Indian Languages (English, Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Odia, Urdu)  
> **Platform Classification:** Full-Stack Web Application (SPA + Node.js/Express Backend) with PWA & Play Store (TWA/Capacitor) Readiness

---

## 1. High-Level System Architecture

The application adopts a **decoupled, full-stack client-server architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Frontend)                         │
│  React 18 SPA + Vite + Tailwind CSS + Lucide Icons + Web Speech API    │
│  - Multilingual State Engine (10 Indian Languages with Native Scripts) │
│  - 20 Welfare Sectors & 36 States/UTs Dynamic Filter Matrix            │
│  - Interactive AI Scheme Agent Drawer & Real-Time RAG Assistant        │
│  - In-App Virtual Indian Multi-Script On-Screen Keyboard               │
│  - High-Contrast / Standard-Contrast WCAG 2.1 Accessibility Modes      │
│  - Voice Input / Output (SpeechSynthesis & SpeechRecognition)          │
│  - OTP Authentication Simulation & State-Specific Eligibility Engine   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST APIs
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER (Backend)                          │
│  Node.js + Express + TypeScript (server.ts)                            │
│  - /api/auth/*: OTP Generation & Verification Services                 │
│  - /api/schemes: Scheme Database (Filter by Sector, State, Level)      │
│  - /api/rag/*: RAG Query Processing & Knowledge Grounding Context      │
│  - /api/eligibility/check: Citizen Multi-Factor Eligibility Evaluation │
│  - /api/stats: Live Metrics (Schemes, Beneficiaries, Subsidies)        │
│  - Vite Middleware / Static Asset Delivery Layer                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & File Organization Structure

```
├── index.html                           # HTML5 Entry Point, SEO Meta & Fonts
├── metadata.json                        # Applet Manifest & Permission Declarations
├── package.json                         # Dependencies & NPM Scripts (dev, build, lint)
├── tsconfig.json                        # Strict TypeScript Compiler Configuration
├── vite.config.ts                       # Vite Bundler Setup
├── server.ts                            # Full-Stack Backend API Server (Express + TS)
│
├── src/                                 # Frontend Application Source Code
│   ├── main.tsx                         # React 18 DOM Root Mount
│   ├── App.tsx                          # Core Application Shell & State Orchestrator
│   │
│   ├── types/                           # Strongly Typed Domain Models
│   │   └── index.ts                     # Schemes, Sectors, Citizens, RAG, i18n Types
│   │
│   ├── lib/                             # Core Business Logic & Infrastructure
│   │   ├── i18n.ts                      # 10-Language Dictionary & Translation Engine
│   │   ├── schemesData.ts               # Verified Database of Central & State Schemes
│   │   ├── sectorsData.ts               # 20 Welfare Sectors Hierarchy & Taxonomies
│   │   └── rag/
│   │       ├── knowledgeBase.ts         # Gazette-Grounded RAG Document Chunks
│   │       └── retriever.ts             # Semantic Token & Grounding Retriever
│   │
│   └── components/                      # Modular, Reusable Component Library
│       ├── common/
│       │   ├── Header.tsx               # National Emblem Banner, Language & Contrast
│       │   └── Footer.tsx               # Official Disclaimers, Portals & Helpline Info
│       ├── auth/
│       │   └── AuthPortal.tsx           # OTP Sign-In Modal (Mobile / Email Verification)
│       ├── schemes/
│       │   ├── SchemeCard.tsx           # Interactive Scheme Card with Badges & CTAs
│       │   └── SchemeDetailsModal.tsx   # Detailed Gazette Modal & Document Checklist
│       ├── agent/
│       │   └── SchemeAgentDrawer.tsx    # Conversational Scheme Guidance Assistant
│       ├── rag/
│       │   ├── RAGAssistant.tsx         # RAG Grounded Chat Screen
│       │   └── RAGInspectorModal.tsx    # Transparency Inspector for Retrieved Chunks
│       ├── keyboard/
│       │   └── VirtualKeyboard.tsx      # On-Screen Keyboard for 10 Indic Scripts
│       └── voice/
│           └── VoiceAssistantModal.tsx  # Hands-Free Indic Voice Guidance Interface
```

---

## 3. Detailed Component & Module Breakdown

### 3.1. Frontend Modules (`src/`)

1. **`src/App.tsx`**
   - **Role:** Main application controller.
   - **State Responsibilities:**
     - `currentLanguage`: Active language (`en`, `hi`, `ta`, `te`, `bn`, `mr`, `kn`, `ml`, `or`, `ur`).
     - `highContrast`: Accessibility toggle adapting background and text colors to WCAG AAA contrast.
     - `selectedSector`: Filtering catalog by 20 specific sectors (Agriculture, Healthcare, Education, etc.).
     - `selectedState`: Filtering by citizen's domicile (36 Indian States & Union Territories).
     - `searchQuery`: Real-time multilingual text filtering.
     - `viewMode`: Grid vs. Sector-Grouped layouts.
     - Active Modals & Drawers: Managed with strict React Hook compliance.

2. **`src/lib/i18n.ts`**
   - **Role:** Centralized Internationalization engine.
   - **Coverage:** Complete translation of all user interface labels, placeholders, buttons, headings, sectors, and schemes across 10 official languages.
   - **Helper Functions:**
     - `getLocalizedSchemeName(scheme, lang)`: Resolves scheme title in user's native script.
     - `getLocalizedSchemeDesc(scheme, lang)`: Resolves scheme summary in user's native script.
     - `getSectorName(sector, lang)`: Translates sector taxonomies.

3. **`src/lib/schemesData.ts` & `src/lib/sectorsData.ts`**
   - **Role:** Curated dataset of genuine Indian government schemes (PM-KISAN, Ayushman Bharat, PMAY, Mudra, Sukanya Samriddhi, Kalaignar Magalir Urimai Thittam, Rythu Bandhu, etc.).
   - Contains direct official links (`.gov.in`, `.nic.in`), benefit amounts, eligibility rules, and mandatory documents.

4. **`src/lib/rag/` (Retrieval-Augmented Generation)**
   - **`knowledgeBase.ts`:** Structured chunks indexed from official government gazettes with metadata (jurisdiction, target sector, ministry, source URL).
   - **`retriever.ts`:** Scoring and retrieval engine matching citizen queries with highest-relevance official document chunks and constructing strictly grounded responses.

5. **`src/components/keyboard/VirtualKeyboard.tsx`**
   - **Role:** Built-in virtual on-screen keyboard supporting native Indic alphabets (Malayalam, Odia, Urdu Nastaliq layout, Tamil, Hindi Devanagari, Telugu, Bengali, Kannada, Marathi, English) allowing citizens to type natively without external IME tools.

6. **`src/components/voice/VoiceAssistantModal.tsx`**
   - **Role:** Audio accessibility for rural/unorganized sector citizens using the native Web Speech API (`webkitSpeechRecognition` & `speechSynthesis`) mapped to Indic language codes (e.g., `hi-IN`, `ta-IN`, `te-IN`, `ml-IN`).

---

## 4. Backend Services Breakdown (`server.ts`)

The backend is built with Express + TypeScript:

1. **Authentication Route (`/api/auth`)**
   - `POST /api/auth/send-otp`: Issues 6-digit OTP to Indian mobile numbers (`+91`) or emails with rate limiting and expiration.
   - `POST /api/auth/verify-otp`: Validates OTP and returns authenticated session token.

2. **Schemes Discovery API (`/api/schemes`)**
   - `GET /api/schemes`: Filter schemes by `sector`, `state`, `level` (Central vs. State), and search keywords.
   - `GET /api/schemes/:id`: Fetch detailed scheme specifications and document checklists.

3. **RAG Grounding API (`/api/rag/query`)**
   - `POST /api/rag/query`: Accepts user query + state context, executes semantic retrieval against the indexed gazette database, and returns grounded answers accompanied by verified citations.

4. **Eligibility Engine (`/api/eligibility/check`)**
   - `POST /api/eligibility/check`: Evaluates citizen parameters (Age, Annual Income, Occupation, Domicile State, Gender, Category) against all schemes and returns qualified schemes with match percentages.

---

## 5. Coding Standards & Review Guidelines

- **Strict Type Safety:** 100% TypeScript with zero implicit `any`. Standard enums and interfaces for all payloads.
- **Rules of Hooks Compliance:** All hooks (`useState`, `useEffect`, `useRef`) are declared at the component top level before any conditional guards.
- **No Console Litter / Clean Execution:** Production-ready code free of debugging clutter.
- **Accessibility:** High-contrast toggle, semantic HTML tags, keyboard navigation, and ARIA labels.
- **Security:** Sanitized input parameters, state validation, and client-side safe token handling.
