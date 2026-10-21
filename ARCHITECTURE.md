# Architecture & Code Structure Specification

This document provides a technical walkthrough of the **JanSeva AI** application architecture for engineering evaluators, auditors, and technical leads.

---

## 1. High-Level Architecture Diagram

```
                        ┌────────────────────────────────────────────────────────┐
                        │                   CLIENT (BROWSER)                     │
                        │  React 19 SPA (Vite + TypeScript + Tailwind CSS)       │
                        └──────────────────────────┬─────────────────────────────┘
                                                   │
                         HTTP / REST API Requests  │  (Port 3000)
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  BACKEND SERVER (Node.js / Express)                    │
│                                           `server.ts`                                  │
├────────────────────────────────┬───────────────────────────┬───────────────────────────┤
│       AUTH CONTROLLER          │     SCHEMES CONTROLLER    │        RAG ENGINE         │
│  - /api/auth/send-otp          │  - /api/schemes           │  - /api/rag/query         │
│  - /api/auth/verify-otp        │  - /api/schemes/check-    │  - /api/rag/stats         │
│  - Rate limiting & OTP store   │    eligibility            │  - Prompt Augmentation   │
└──────────────┬─────────────────┴─────────────┬─────────────┴─────────────┬─────────────┘
               │                               │                           │
               ▼                               ▼                           ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────┐
│     In-Memory OTP Store     │ │   Schemes Knowledge Base    │ │  Google Gemini Model    │
│   (5-minute TTL, secure)    │ │   200 Schemes (20 Sectors)  │ │   `gemini-3.8-flash`    │
└─────────────────────────────┘ └─────────────────────────────┘ └─────────────────────────┘
```

---

## 2. Directory Structure & Line Responsibilities

### Root Directory
- **`server.ts`**: The backend entry point. Configures Express middleware, security headers, in-memory OTP state, Gemini SDK instance, REST routes for authentication, scheme search, eligibility calculations, and mounts Vite in middleware mode.
- **`package.json`**: Package dependencies, TypeScript tooling, and build scripts.
- **`tsconfig.json`**: TypeScript configuration targeting modern ESNext and React JSX.
- **`metadata.json`**: AI Studio runtime metadata and permissions.
- **`index.html`**: HTML shell containing font imports, viewport setup, and root container.
- **`.env.example`**: Environment variable template (`GEMINI_API_KEY`, `APP_URL`).

---

### `src/types/` — Domain Type Definitions
- **`src/types/index.ts`**:
  - `LanguageCode`: Union type of all 10 supported language codes (`en | hi | ta | te | bn | mr | kn | ml | or | ur`).
  - `UserProfile`: Authenticated citizen data model with token, contact value, state, and timestamp.
  - `Sector`: 20 standardized government sectors.
  - `Scheme`: Full scheme schema including eligibility bounds, regional titles, documentation, and URL.
  - `CitizenProfileInput`: Input form state for the 4-step eligibility wizard.
  - `EligibilityResult`: Detailed evaluation result with score, qualified, and disqualified factors.

---

### `src/data/` — Static Datasets
- **`src/data/schemesData.ts`**:
  - `ALL_20_SECTORS`: Array of exactly 20 priority welfare sectors.
  - `SCHEMES_DATABASE`: 200 fully populated schemes (exactly 10 schemes per sector). Every scheme includes ministry, level (Central/State), financial benefits, and step-by-step processes.

---

### `src/lib/` — Business Logic, i18n & RAG Pipeline
- **`src/lib/i18n.ts`**:
  - `TranslationDict`: Type interface defining all translatable UI keys.
  - `TRANSLATIONS`: Dictionaries for all 10 languages covering brand headers, navigation tabs, search filters, modal content, eligibility questions, and voice prompts.
  - `getSectorName(sector, lang)`: Helper returning localized sector name.
  - `getLocalizedSchemeName(scheme, lang)`: Helper returning regional name with English fallback.
- **`src/lib/rag/types.ts`**:
  - Interfaces for knowledge chunks, retrieval queries, and cited sources.
- **`src/lib/rag/retriever.ts`**:
  - Tokenizes scheme records into indexed chunks (Overview, Financial Benefits, Eligibility, Documents, Process).
  - Implements hybrid keyword-density and sector-boosted retrieval algorithm.
  - Constructs citation-grounded prompts for the Gemini model.

---

### `src/components/` — Modular Presentation Components

1. **`auth/AuthPortal.tsx`**:
   - Manages Sign In vs. Sign Up mode.
   - Handles Mobile Number (+91) and Email verification.
   - 6-digit individual PIN input boxes with auto-focus advance, backspace handling, and paste support.
   - Resend timer countdown and instant sample fill.

2. **`layout/Navbar.tsx`**:
   - Top government header banner with emblem.
   - High-contrast accessibility toggle.
   - Active language dropdown (10 languages).
   - State/UT coverage selector.
   - 4-tab primary navigation switcher (`Catalog`, `Eligibility Journey`, `What Am I Missing?`, `Document Checklist`).
   - Citizen profile summary and Sign Out trigger.

3. **`schemes/SchemeCard.tsx` & `schemes/SchemeDetailsModal.tsx`**:
   - `SchemeCard`: Displays badges (Central/State, State name, Sector icon), title, description, and financial benefit highlight.
   - `SchemeDetailsModal`: Comprehensive modal displaying criteria checklist, necessary documentation, application steps, and portal launch link.

4. **`eligibility/EligibilityWizard.tsx`**:
   - 4-step guided wizard: Personal Demographics → Social & Economic Status → Landholding & Occupation → Computed Scheme Results.
   - Real-time scoring and color-coded qualification indicators.

5. **`benefits/BenefitFinder.tsx`**:
   - "What Am I Missing?" tab displaying stacked benefit packages tailored for small farmers, rural women, students, and senior citizens.
   - Bundles complementary schemes to maximize cumulative welfare value.

6. **`documents/DocumentChecklist.tsx`**:
   - Common documentation readiness tracker (Aadhaar, Ration Card, Income Certificate, Domicile, Land Records, etc.).
   - Interactive checkboxes allowing citizens to mark available vs. pending paperwork with direct application links.

7. **`keyboard/VirtualKeyboard.tsx`**:
   - On-screen virtual keyboard with dedicated layouts for English, Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Odia, and Urdu.
   - Supports consonant grids, independent vowels, dependent vowel signs (matras), virama conjuncts, and RTL text layout for Urdu.

8. **`voice/VoiceAssistantModal.tsx`**:
   - Browser Web Speech API integration (`SpeechRecognition` and `SpeechSynthesis`).
   - One-tap speak button with pulsing waveform animation.
   - Pre-configured quick voice questions for each language.
   - Real-time transcript display and audio playback.

9. **`agent/SchemeAgentDrawer.tsx`**:
   - Slide-out conversational scheme agent drawer.
   - Displays citations and verifiable government sources for every generated response.
   - Direct integration with both the Virtual Keyboard and Voice Assistant.

10. **`rag/RAGInspectorModal.tsx`**:
    - Developer and auditor inspection tool showing retrieved chunks, similarity scores, and constructed prompts.

---

## 3. Data Flow Architecture

### User Authentication Flow
1. User enters mobile number or email in `AuthPortal.tsx`.
2. Frontend triggers `POST /api/auth/send-otp` on `server.ts`.
3. Backend generates a 6-digit code with 5-minute expiry in `otpStore`.
4. User inputs OTP digits (or uses the sample test code).
5. Frontend calls `POST /api/auth/verify-otp`.
6. Backend validates the code and returns an authenticated `UserProfile`.
7. `App.tsx` persists the user session in `localStorage` and transitions into the authenticated portal.

### Multilingual RAG Query Flow
1. User speaks in the `VoiceAssistantModal` or types query via `VirtualKeyboard` in the `SchemeAgentDrawer`.
2. Request is dispatched to `POST /api/rag/query` with `query`, `state`, `sector`, and `language`.
3. Backend invokes `retrieveRelevantChunks` from `src/lib/rag/retriever.ts`.
4. Chunks are ranked and top-K candidates are extracted.
5. System prompt is augmented with official sources.
6. If Gemini API is configured, `ai.models.generateContent({ model: 'gemini-3.8-flash', contents })` generates the localized response. Otherwise, the deterministic grounded fallback handles the query.
7. The answer is displayed with clickable official portal citations.

---

## 4. Code Quality & Verification Summary
- **Type Checker**: Strict TypeScript (`tsc --noEmit`) passes with 0 warnings/errors.
- **Bundle Compilation**: Vite build succeeds cleanly with tree-shaken assets.
- **Port Compliance**: Runs cleanly on port 3000 under containerized environments.
