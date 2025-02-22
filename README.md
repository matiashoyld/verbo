# verbo.ai

![Verbo.ai Banner](/public/images/verbo-banner.png)

(You can play with the app [here](https://verbo-alpha.vercel.app/))

A skill assessment platform that transforms the hiring process through AI-driven interviews. Recruiters select specific technical or soft skills to evaluate, and applicants engage with an AI agent that guides them through interactive challenges while recording both audio and screen activity. The platform automatically extracts evidence of each skill from the recorded session and provides AI-powered assessments, drastically reducing the manual overhead of live interviews while maintaining consistency and objectivity.

---

## Table of Contents

- [verbo.ai](#verboai)
  - [Table of Contents](#table-of-contents)
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

verbo.ai aims to revolutionize the hiring process by automating skill assessments through AI-driven interviews. By having candidates interact with an AI agent that guides them through challenges, the platform captures authentic demonstrations of skills while providing immediate feedback. The system automatically analyzes recordings to provide recruiters with detailed insights into candidate capabilities, making the hiring process more efficient and objective.

---

## Core Objectives

1. **Accurate Skill Measurement**  
   AI-driven breakdown of candidate proficiency in targeted skills.

2. **Efficient Evaluation Process**  
   Automated interview process that saves time while maintaining consistency.

3. **Actionable Feedback**  
   Immediate insights and personalized feedback for both recruiters and candidates.

4. **Scalable Architecture**  
   Flexible system supporting various assessment types (coding, design, communication).

---

## Features and Use Cases

• **Recruiter Onboarding / Setup**  

- Create skill-based assessment pipelines
- Configure or customize scenario-based challenges
- Set up evaluation criteria and skill tags

• **Candidate Assessment**  

- Interactive AI-guided interviews
- Real-time audio and screen recording
- Clear instructions and immediate feedback

• **Analytics & Reporting**  

- Skill-specific performance metrics
- AI-generated evidence of competencies
- Comparative candidate analytics

• **Recruiter Dashboard**  

- Review recordings with AI annotations
- Track candidate progress and rankings
- Export detailed assessment reports

---

## Tech Stack

verbo.ai is built on the [T3 Stack](https://create.t3.gg/), which combines:

- **Front-End**:  
  - [Next.js](https://nextjs.org/) – React-based framework for server-rendered or static apps
  - [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
  - [shadcn/ui](https://ui.shadcn.com/) – Pre-built Tailwind-based components

- **Back-End**:  
  - [TypeScript](https://www.typescriptlang.org/) – Type-safe development
  - [tRPC](https://trpc.io/) – End-to-end type-safe APIs
  - [Prisma](https://prisma.io/) – Type-safe ORM for DB interactions
  - [Supabase](https://supabase.com) – Postgres database, auth, and storage

- **Additional Services / Tools**:  
  - [Vercel AI SDK](https://sdk.vercel.ai/) – AI integration for assessments
  - [OpenAI Whisper](https://openai.com/research/whisper) – Speech-to-text transcription
  - Hosted on [Vercel](https://vercel.com)

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
│  │  ├─ recruiter/ # Recruiter dashboard and features
│  │  ├─ candidate/ # Candidate assessment interface
│  │  ├─ layout.tsx # Root layout
│  │  └─ page.tsx # Landing page
│  ├─ components/ # React components
│  │  ├─ recruiter/ # Recruiter-specific components
│  │  ├─ candidate/ # Candidate-specific components
│  │  └─ ui/ # Shared UI components (shadcn/ui)
│  ├─ lib/ # Utility functions and shared logic
│  │  ├─ ai.ts # AI integration utilities
│  │  └─ recording.ts # Audio/screen recording logic
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

- **Supabase Account** for database, auth, and storage
  1. Sign up at [supabase.com](https://supabase.com)
  2. Create a new project
  3. Get your project URL and API keys
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
   # Supabase Configuration (Required)
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # OpenAI (Required for AI features)
   OPENAI_API_KEY="your-openai-api-key"

   # Google Generative AI (Required for AI features)
   GOOGLE_GENERATIVE_AI_API_KEY="your-google-generative-ai-api-key"

   # Node Environment
   NODE_ENV="development"
   ```

4. **Set Up the Database**  

   a. First, make sure your Supabase project is properly configured

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

   b. Sign up using Supabase authentication

7. **Troubleshooting Common Issues**

   - If you get database connection errors:
     - Verify your Supabase configuration
     - Ensure your database is running
     - Try running `npx prisma db push` to sync schema

   - If you get authentication errors:
     - Verify your Supabase API keys
     - Ensure all required environment variables are set

   - If you get TypeScript errors:
     - Run `npm run typecheck` to see detailed errors
     - Ensure all dependencies are installed with `npm install`

---

## Usage

Once the server is running:

- Open <http://localhost:3000> to view the landing page
- Sign in or sign up (via Supabase auth)
- Recruiters can create skill assessments, configure challenges, and review candidate performances
- Candidates can participate in AI-guided interviews and receive immediate feedback

---

## Authentication

verbo.ai uses [Supabase Auth](https://supabase.com/auth) for authentication and user management. By default, it provides:

- **Secure sign-in** with multiple methods (email, OAuth)
- **User roles** for recruiters and candidates
- **Protected endpoints** via Supabase middleware

Ensure you have properly set up your Supabase project and environment variables.

---

## Deployment

The app is deployed on [Vercel](https://vercel.com), and you can access the live version at [verbo-alpha.vercel.app](https://verbo-alpha.vercel.app/).

---

## Additional Considerations

1. **AI Integration**  
   - Leverages [Vercel AI SDK](https://sdk.vercel.ai/) for skill assessment and analysis
   - Uses [OpenAI Whisper](https://openai.com/research/whisper) for speech-to-text
   - Implements streaming responses for real-time AI interaction

2. **Recording & Storage**  
   - Uses `MediaRecorder` for audio/screen capture
   - Secure storage in Supabase for all recordings
   - Efficient chunking and upload strategies

3. **Analytics & Assessment**  
   - AI-powered skill evidence extraction
   - Comparative analytics across candidates
   - Customizable assessment criteria
