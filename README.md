# verbo.ai

A voice-based reading reflection platform that promotes authentic student engagement through spoken responses to reading assignments. Professors can upload reading materials, create or customize comprehension questions, and receive valuable insights into student performance through automated transcription, analytics, and feedback tools. By focusing on spoken responses instead of written submissions, verbo.ai helps mitigate the issue of AI-generated text content and restores genuine learning interactions.

---

## Table of Contents

1. [Introduction](#introduction)  
2. [Core Objectives](#core-objectives)  
3. [Features and Use Cases](#features-and-use-cases)  
4. [Tech Stack](#tech-stack)  
5. [Folder Structure](#folder-structure)  
6. [Prerequisites](#prerequisites)  
7. [Getting Started](#getting-started)  
8. [Usage](#usage)  
9. [Authentication](#authentication)  
10. [Deployment](#deployment)  
11. [Additional Considerations](#additional-considerations)  
12. [License](#license)

---

## Introduction

verbo.ai aims to transform reading assignments into interactive, voice-based reflections. By requiring students to speak their responses, the platform promotes genuine engagement and reduces reliance on AI-generated text for answering questions. The platform automatically transcribes and analyzes these spoken submissions so that professors can quickly assess performance and address areas of misunderstanding.

---

## Core Objectives

1. **Authentic Engagement**  
   Students respond verbally to questions, encouraging spontaneous and genuine answers.

2. **Real-Time Analysis**  
   Speech-to-text processing provides immediate feedback and insights for both students and professors.

3. **Insights & Analytics**  
   Professors gain visibility into areas of confusion or misunderstanding, with the help of analytics dashboards and automated metrics.

4. **Scalability & Efficiency**  
   Architecture designed to scale for larger academic or training institutions, supporting K-12, colleges, and corporate training programs.

---

## Features and Use Cases

• **Professor Onboarding / Setup**  
  - Upload reading materials (PDF, text, etc.).  
  - Auto-generate or manually create comprehension questions.  

• **Student Reading & Response**  
  - Students view assigned readings and questions.  
  - Submit voice-based responses for real-time transcription and feedback.

• **Analytics & Reporting**  
  - Aggregated performance metrics (e.g., common issues, average response length, sentiment).  
  - Dashboard with class-wide or group insights.  

• **Professor Dashboard & Feedback**  
  - View and provide feedback on student submissions.  
  - Identify unclear or low-confidence answers for additional review.  

• **Security & Privacy**  
  - Securely handle sensitive data (audio files, transcripts) with encryption, authentication, and role-based permissions.

---

## Tech Stack

verbo.ai is built on the [T3 Stack](https://create.t3.gg/), which combines:

- **Front-End**:  
  - [Next.js](https://nextjs.org/) – React-based framework for server-rendered or static apps.  
  - [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework for custom UI.  
  - [shadcn/ui](https://ui.shadcn.com/) – Pre-built Tailwind-based components.

- **Back-End**:  
  - [TypeScript](https://www.typescriptlang.org/) – Type-safe development.  
  - [tRPC](https://trpc.io/) – End-to-end type-safe APIs.  
  - [Prisma](https://prisma.io/) – Type-safe ORM for DB interactions.  
  - [Neon](https://neon.tech) – Serverless PostgreSQL database (or alternative PostgreSQL hosting).

- **Additional Services / Tools**:  
  - [Clerk](https://clerk.com) – Authentication and user management.  
  - [OpenAI Whisper](https://openai.com/research/whisper) – Speech-to-text transcription.  
  - [Vercel AI SDK](https://sdk.vercel.ai/) – Typescript toolkit for AI-based question generation, analytics, etc.  
  - [ffmpeg](https://ffmpeg.org/) – Audio processing and conversion.  
  - Testing with [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/), or [Cypress](https://www.cypress.io/) for E2E.  
  - Hosted on [Vercel](https://vercel.com).

---

## Folder Structure

Below is the recommended structure (aligned with a typical T3 stack + Next.js project):

```
verbo-ai/
├─ .env # Environment variables (DB connections, API keys)
├─ .eslintrc.js # Linting configuration
├─ .prettierrc # Prettier configuration
├─ package.json
├─ prisma/
│ ├─ schema.prisma # Prisma schema for database models
├─ src/
│ ├─ pages/ # Next.js pages
│ │ ├─ api/
│ │ │ └─ trpc/ # (If you're exposing tRPC through Next's API routes)
│ │ ├─ index.tsx # Landing page
│ │ ├─ dashboard.tsx # Professor's main dashboard
│ │ ├─ student/
│ │ │ ├─ index.tsx # Student landing / dashboard
│ │ │ ├─ responses.tsx # Page for recording/listening to responses
│ │ │ └─ ...
│ ├─ server/
│ │ ├─ trpc/
│ │ │ ├─ index.ts # tRPC router entry
│ │ │ ├─ questions.ts # tRPC router for question endpoints
│ │ │ ├─ readings.ts # tRPC router for reading materials
│ │ │ └─ users.ts # tRPC router for user management
│ │ ├─ db.ts # Prisma client instance
│ ├─ components/ # Reusable UI components
│ │ ├─ ui/
│ │ │ ├─ Button.tsx
│ │ │ ├─ Input.tsx
│ │ │ ├─ Navbar.tsx
│ │ │ └─ ...
│ ├─ lib/ # Utility functions, helpers
│ │ └─ speechToText.ts # Abstraction for speech-to-text logic
│ ├─ styles/
│ │ └─ globals.css # Tailwind CSS imports, global styles
├─ tsconfig.json
└─ README.md
```


---

## Prerequisites

- **Node.js** (v18 or above recommended)  
- **npm** (v9 or above) or Yarn / pnpm  
- **PostgreSQL database** set up on [Neon](https://neon.tech) or your preferred hosting provider.  
- **Clerk** account for authentication (optional if you use a different auth provider, but this is highly recommended).  
- **ffmpeg** installed for audio processing.

---

## Getting Started

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/verbo-ai.git
   cd verbo-ai
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```

3. **Configure Environment Variables**  
   Create `.env` and set the necessary values:  
   - `DATABASE_URL` – Connection string to your PostgreSQL database (e.g., from Neon)  
   - `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` – Clerk credentials  
   - `NEXT_PUBLIC_AI_SDK_KEY` or similar for OpenAI / Vercel AI.  

4. **Set Up the Database**   
   - Update your `.env` with the correct `DATABASE_URL`.  
   - Run Prisma migrations:  
     ```bash
     npx prisma migrate dev
     ```

5. **Start the Development Server**  
   ```bash
   npm run dev
   ```
   This will start the Next.js dev server at http://localhost:3000.

---

## Usage

Once the server is running:

- Open http://localhost:3000 to view the landing page.  
- Sign in or sign up (if Clerk is configured).  
- Professors can access the dashboard to create or upload reading materials, manage questions, and view analytics.  
- Students can view assigned readings, record voice responses, and receive immediate transcription feedback.

---

## Authentication

verbo.ai uses [Clerk](https://clerk.com) for authentication and user management. By default, it provides:

- **Secure sign-in** with multiple methods (email, OAuth).  
- **User roles** for professors, students, and admin.  
- **Protected endpoints** via Clerk middleware in Next.js or tRPC.

Ensure you have properly set up your Clerk application and environment variables. For more information, see the official Clerk docs: https://docs.clerk.com.

---

## Deployment

The app is deployed on [Vercel](https://vercel.com), and you can access the live version at [verbo-alpha.vercel.app](https://verbo-alpha.vercel.app/) (source: [verbo-alpha vercel website](https://verbo-alpha.vercel.app/)).


---

## Additional Considerations

1. **AI Integration**  
   - We strongly leverage the [Vercel AI SDK](https://sdk.vercel.ai/) for advanced NLP tasks (自动 question generation, analytics, etc.).  
   - Real-time transcription uses [OpenAI Whisper](https://openai.com/research/whisper) or fallback to the Web Speech API.

2. **Audio Processing & Transcription**  
   - Implement `MediaRecorder` for capturing audio in the browser.  
   - Use ffmpeg to convert recorded audio to MP3 (if needed).  
   - Communicate with the Whisper API to transcribe student responses.

3. **Analytics & Feedback**  
   - Generate user-friendly dashboards to highlight performance, average response time, or confusion areas.  
   - Provide optional personal feedback from professors.

4. **Security & Privacy**  
   - Strict role-based access controls (professor vs. student).  
   - Encryption of audio files and transcripts (where feasible).  
   - Infrastructure compliance with educational data privacy regulations (e.g., FERPA).

5. **Testing**  
   - Unit and integration tests are performed with [Vitest](https://vitest.dev/)  
   - UI tests can be written with [React Testing Library](https://testing-library.com/)  
   - Additional E2E coverage can be added if desired.