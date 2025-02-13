# verbo.ai

![Verbo.ai Banner](/public/images/verbo-banner.png)

(You can play with the app [here](https://verbo-alpha.vercel.app/))

A voice-based reading reflection platform that promotes authentic student engagement through spoken responses to reading assignments. Professors can upload reading materials, create or customize comprehension questions, and receive valuable insights into student performance through automated transcription, analytics, and feedback tools. By focusing on spoken responses instead of written submissions, verbo.ai helps mitigate the issue of AI-generated text content and restores genuine learning interactions.

---

## Table of Contents

- [Introduction](#introduction)
- [Core Objectives](#core-objectives)
- [Features and Use Cases](#features-and-use-cases)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Additional Considerations](#additional-considerations)

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
  - Hosted on [Vercel](https://vercel.com).

---

## Folder Structure

Below is the project structure using Next.js App Router:

```
verbo/
├─ .env # Environment variables (DB connections, API keys)
├─ prisma/
│  ├─ schema.prisma # Database schema
│  └─ migrations/ # Database migrations
├─ src/
│  ├─ app/ # Next.js App Router pages
│  │  ├─ (auth)/ # Authentication-related pages
│  │  ├─ api/ # API routes
│  │  │  ├─ trpc/[trpc]/ # tRPC handler
│  │  │  └─ webhooks/ # External service webhooks
│  │  ├─ professor/ # Professor dashboard and features
│  │  ├─ student/ # Student dashboard and features
│  │  ├─ layout.tsx # Root layout
│  │  └─ page.tsx # Landing page
│  ├─ components/ # React components
│  │  ├─ professor/ # Professor-specific components
│  │  ├─ student/ # Student-specific components
│  │  └─ ui/ # Shared UI components (shadcn/ui)
│  ├─ lib/ # Utility functions and shared logic
│  │  └─ prompts.ts # AI prompt templates
│  ├─ server/ # Server-side code
│  │  └─ api/ # tRPC routers and procedures
│  ├─ styles/ # Global styles
│  │  └─ globals.css # Tailwind imports
│  ├─ trpc/ # tRPC configuration
│  │  ├─ react.tsx # React hooks provider
│  │  └─ server.ts # Server configuration
│  ├─ types/ # TypeScript type definitions
│  └─ utils/ # Helper functions
├─ public/ # Static assets
├─ tailwind.config.ts # Tailwind configuration
├─ tsconfig.json # TypeScript configuration
└─ package.json # Project dependencies and scripts
```

---

## Prerequisites

Before you begin, ensure you have the following installed and set up:

- **Node.js** (v18 or above recommended)
  ```bash
  node --version  # Should be v18.x.x or higher
  ```
- **npm** (v9 or above)
  ```bash
  npm --version  # Should be v9.x.x or higher
  ```
- **PostgreSQL database** set up on [Neon](https://neon.tech) or your preferred hosting provider
- **Clerk Account** for authentication
  1. Sign up at [clerk.com](https://clerk.com)
  2. Create a new application
  3. Get your API keys from the Clerk Dashboard
- **OpenAI API Key** for AI features
  1. Sign up at [platform.openai.com](https://platform.openai.com)
  2. Create an API key in your dashboard

---

## Getting Started

1. **Clone the Repository**  

   ```bash
   git clone https://github.com/matiashoyld/verbo.git
   cd verbo
   ```

2. **Install Dependencies**  

   ```bash
   npm install
   ```

3. **Configure Environment Variables**  
   Create a `.env` file in the root directory with the following variables:

   ```env
   # Database (Required)
   DATABASE_URL="your-postgresql-connection-string"

   # Clerk Authentication (Required)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   CLERK_WEBHOOK_SECRET="your-clerk-webhook-secret"

   # OpenAI (Required for AI features)
   OPENAI_API_KEY="your-openai-api-key"

   # Google Generative AI (Required for AI features)
   GOOGLE_GENERATIVE_AI_API_KEY="your-google-generative-ai-api-key"

   # Node Environment
   NODE_ENV="development"
   ```

4. **Set Up the Database**  
   
   a. First, make sure your PostgreSQL database is running and accessible
   
   b. Run Prisma migrations to set up your database schema:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

   c. (Optional) View your database with Prisma Studio:
   ```bash
   npm run db:studio
   ```

5. **Start the Development Server**  

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

6. **Setting Up Your First Account**

   a. Visit [http://localhost:3000](http://localhost:3000)
   
   b. Sign up using Clerk's authentication

7. **Troubleshooting Common Issues**

   - If you get database connection errors:
     - Verify your DATABASE_URL in .env
     - Ensure your database is running
     - Try running `npx prisma db push` to sync schema

   - If you get authentication errors:
     - Verify your Clerk API keys
     - Ensure all required Clerk environment variables are set

   - If you get TypeScript errors:
     - Run `npm run typecheck` to see detailed errors
     - Ensure all dependencies are installed with `npm install`

---

## Usage

Once the server is running:

- Open <http://localhost:3000> to view the landing page.  
- Sign in or sign up (if Clerk is configured).  
- Professors can access the dashboard to create or upload reading materials, manage questions, and view analytics.  
- Students can view assigned readings, record voice responses, and receive immediate transcription feedback.

---

## Authentication

verbo.ai uses [Clerk](https://clerk.com) for authentication and user management. By default, it provides:

- **Secure sign-in** with multiple methods (email, OAuth).  
- **User roles** for professors, students, and admin.  
- **Protected endpoints** via Clerk middleware in Next.js or tRPC.

Ensure you have properly set up your Clerk application and environment variables. For more information, see the official Clerk docs: <https://docs.clerk.com>.

---

## Deployment

The app is deployed on [Vercel](https://vercel.com), and you can access the live version at [verbo-alpha.vercel.app](https://verbo-alpha.vercel.app/) (source: [verbo-alpha vercel website](https://verbo-alpha.vercel.app/)).

---

## Additional Considerations

1. **AI Integration**  
   - We strongly leverage the [Vercel AI SDK](https://sdk.vercel.ai/) for advanced NLP tasks (question generation, analytics, etc.).  
   - Real-time transcription uses [OpenAI Whisper](https://openai.com/research/whisper) with fallback to the Web Speech API.

2. **Audio Processing & Transcription**  
   - Implement `MediaRecorder` for capturing audio in the browser.  
   - Audio is captured in WebM/MP3 format (based on browser support).  
   - Direct integration with OpenAI Whisper API for transcription.

3. **Analytics & Feedback**  
   - Generate user-friendly dashboards to highlight performance, average response time, or confusion areas.  
   - Provide optional personal feedback from professors.
