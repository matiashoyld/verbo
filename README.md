# verbo.ai

![Verbo.ai Banner](/public/verbo-banner.png)

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
  - [Color Palette](#color-palette)

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
  - [Supabase](https://supabase.com) – Postgres database and storage

- **Authentication**:
  - [Clerk](https://clerk.com/) – Full-featured authentication and user management

- **AI Integration**:
  - [Vercel AI SDK](https://sdk.vercel.ai/) – AI integration framework
  - [OpenAI API](https://openai.com/api/) – GPT models for AI interactions
  - [Google Generative AI](https://ai.google.dev/) – Advanced AI capabilities

- **Additional Services / Tools**:  
  - Hosted on [Vercel](https://vercel.com)

---

## Folder Structure

Below is the project structure using Next.js App Router:

```bash
verbo/
├─ .env # Environment variables (DB connections, API keys)
├─ prisma/
│  ├─ schema.prisma # Database schema
│  └─ migrations/ # Database migrations
├─ src/
│  ├─ app/ # Next.js App Router pages
│  │  ├─ api/ # API routes
│  │  │  ├─ trpc/[trpc]/ # tRPC handler
│  │  │  └─ webhooks/ # External service webhooks
│  │  ├─ recruiter/ # Recruiter dashboard and features
│  │  ├─ candidate/ # Candidate assessment interface
│  │  ├─ sign-in/ # Clerk authentication pages
│  │  ├─ sign-up/ # Clerk authentication pages
│  │  ├─ layout.tsx # Root layout
│  │  └─ page.tsx # Landing page
│  ├─ components/ # React components
│  │  ├─ ui/ # shadcn/ui components
│  │  ├─ recruiter/ # Recruiter-specific components
│  │  └─ candidate/ # Candidate-specific components
│  ├─ lib/ # Utility functions and shared logic
│  │  ├─ ai.ts # AI integration utilities
│  │  ├─ prompts/ # LLM prompt templates
│  │  └─ recording.ts # Audio/screen recording logic
│  ├─ middleware.ts # Clerk authentication middleware
│  ├─ server/ # Server-side code
│  │  └─ api/ # tRPC routers and procedures
│  ├─ styles/ # Global styles
│  │  └─ globals.css # Tailwind imports
│  ├─ trpc/ # tRPC configuration
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

- **Supabase Account** for database and storage
  1. Sign up at [supabase.com](https://supabase.com)
  2. Create a new project
  3. Set up your database and get your connection URLs

- **Clerk Account** for authentication
  1. Sign up at [clerk.com](https://clerk.com)
  2. Create a new application
  3. Get your API keys from the dashboard

- **OpenAI API Key** for AI features
  1. Sign up at [platform.openai.com](https://platform.openai.com)
  2. Create an API key in your dashboard

- **Google AI API Key** for generative AI features
  1. Sign up at [ai.google.dev](https://ai.google.dev)
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
   # Database Configuration (Required)
   DATABASE_URL="your-supabase-database-url"
   DIRECT_URL="your-supabase-direct-connection-url"

   # Clerk Authentication (Required)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   CLERK_WEBHOOK_SECRET="your-clerk-webhook-secret"

   # OpenAI (Required for AI features)
   OPENAI_API_KEY="your-openai-api-key"

   # Google Generative AI (Required for AI features)
   GOOGLE_AI_API_KEY="your-google-ai-api-key"

   # Node Environment
   NODE_ENV="development"
   ```

4. **Set Up the Database**  

   a. First, make sure your Supabase project is properly configured

   b. Run Prisma migrations to set up your database schema:

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations or push schema to database
   npx prisma migrate dev
   # or
   npx prisma db push
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

   b. Sign up using Clerk authentication

7. **Troubleshooting Common Issues**

   - If you get database connection errors:
     - Verify your Supabase database URL configuration
     - Check that your database is running and accessible
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

- Open <http://localhost:3000> to view the landing page
- Sign in or sign up (via Clerk authentication)
- Recruiters can create skill assessments, configure challenges, and review candidate performances
- Candidates can participate in AI-guided interviews and receive immediate feedback

---

## Authentication

verbo.ai uses [Clerk](https://clerk.com) for authentication and user management. By default, it provides:

- **Secure sign-in** with multiple methods (email, social OAuth)
- **User management** with roles and permissions
- **Protected routes** via middleware
- **WebAuthn** support for passwordless authentication

Ensure you have properly set up your Clerk project and environment variables.

---

## Deployment

The application can be deployed to Vercel by following these steps:

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Select your repository and click "Import"

3. **Configure environment variables**
   - Add all the required environment variables from your `.env` file

4. **Set up database**
   - Ensure your Supabase database is configured properly
   - Check that the `DATABASE_URL` and `DIRECT_URL` environment variables are set correctly

5. **Configure Vercel Function Timeout**
   - This application uses AI features that may require longer execution times
   - After deploying, go to Project Settings → Functions
   - Set "Max Duration" to at least 60 seconds
   - Alternatively, add `VERCEL_FUNCTIONS_MAXDURATION` with value `60` in environment variables

6. **Deploy!**
   - Click "Deploy" and wait for the build process to complete

### Troubleshooting Vercel Deployments

If you encounter issues with function timeouts or error messages like "Stream closed", try these steps:

1. **Ensure function timeout is set to 60 seconds**
   - Go to Project Settings → Functions → set "Max Duration" to 60
   - This is critical for AI operations that may take longer than the default timeout

2. **Check Vercel logs**
   - Functions using AI models (especially for skills extraction) may take longer
   - Log into Vercel dashboard and check the function logs for errors

3. **Verify API keys**
   - Double-check that all API keys (Google AI, OpenAI) are correctly set
   - Different environments (development vs production) may require different API keys

4. **Database connection issues**
   - Make sure your database connection URLs are correct
   - Verify that your IP is whitelisted in Supabase if required

---

## Additional Considerations

1. **AI Integration**  
   - Leverages [Vercel AI SDK](https://sdk.vercel.ai/) for skill assessment and analysis
   - Uses multiple AI models including OpenAI's GPT models and Google's Generative AI
   - Implements streaming responses for real-time AI interaction

2. **Recording & Storage**  
   - Uses `MediaRecorder` for audio/screen capture
   - Secure storage in Supabase for all recordings
   - Efficient chunking and upload strategies

3. **Analytics & Assessment**  
   - AI-powered skill evidence extraction
   - Comparative analytics across candidates
   - Customizable assessment criteria

4. **LLM Prompts Management**
   - All prompt templates stored in `src/lib/prompts/`
   - Each prompt template in its own file for maintainability
   - Exposed through `src/lib/prompts/index.ts`
   - Function parameters for dynamic content injection

## Color Palette

verbo.ai uses a custom color palette defined in `tailwind.config.ts` under the 'verbo' namespace:

- **verbo-green**: #73ea91 - Primary action, success states
- **verbo-purple**: #872ce5 - Accent color, highlights
- **verbo-blue**: #53a1e8 - Secondary actions, information
- **verbo-dark**: #321864 - Text, headers, primary brand color

These colors can be used with Tailwind classes like `text-verbo-dark` or `bg-verbo-purple` and support opacity modifiers.
