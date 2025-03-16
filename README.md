# verbo.ai

![Verbo.ai Banner](/public/verbo-banner.png)

(You can play with the app as a Recruiter you can create an account [here](https://verbo-alpha.vercel.app/). If you want to test the app as a Candidate, try out [this case](https://verbo-alpha.vercel.app/candidate/position/6cf04ff0-5854-4344-87fd-2733f615b6b3))

Verbo is a skill assessment platform that transforms the hiring process through AI-driven interviews. Recruiters select specific technical or soft skills to evaluate, and applicants engage with an AI agent that guides them through interactive challenges while recording both audio and screen activity. The platform automatically extracts evidence of each skill from the recorded session and provides AI-powered assessments, drastically reducing the manual overhead of live interviews while maintaining consistency and objectivity.

---

## Table of Contents

- [verbo.ai](#verboai)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Core Objectives](#core-objectives)
  - [Features and Use Cases](#features-and-use-cases)
  - [Tech Stack](#tech-stack)
  - [Skills Taxonomy](#skills-taxonomy)
  - [Video Compression](#video-compression)
  - [Folder Structure](#folder-structure)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
  - [Authentication](#authentication)
  - [Deployment](#deployment)
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
  - [Magic UI](https://magic-ui.design/) – Advanced UI components for interactivity enhancements

- **Back-End**:  
  - [TypeScript](https://www.typescriptlang.org/) – Type-safe development
  - [tRPC](https://trpc.io/) – End-to-end type-safe APIs
  - [Prisma](https://prisma.io/) – Type-safe ORM for DB interactions
  - [Supabase](https://supabase.com) – Postgres database and storage

- **Authentication**:
  - [Clerk](https://clerk.com/) – Full-featured authentication and user management

- **AI Integration**:
  - [Google Generative AI](https://ai.google.dev/) – Advanced AI capabilities

- **Additional Services / Tools**:  
  - Hosted on [Vercel](https://vercel.com)

---

## Skills Taxonomy

Verbo uses a comprehensive skills taxonomy that categorizes skills across different domains. The taxonomy is structured as:

- **Categories**: Broad skill domains (e.g., Programming, Data Visualization, Leadership & Management)
- **Skills**: Specific competencies within categories (e.g., Python, Design Principles, Team Motivation)
- **Competencies**: Specific measurable abilities within skills (e.g., Data Manipulation, Performance & Parallelization)

Each competency includes detailed rubrics with 5 levels of proficiency:
1. **Level 1 (Inadequate)**: Fundamental misunderstanding or inability
2. **Level 2 (Needs Guidance)**: Limited understanding, requires significant assistance
3. **Level 3 (Competent)**: Basic understanding and application with some guidance
4. **Level 4 (Proficient)**: Strong understanding with consistent application
5. **Level 5 (Exceptional)**: Mastery with advanced application and innovation

The taxonomy serves as the foundation for assessment, providing standardized evaluation criteria across all interviews.

## Video Compression

Verbo implements efficient video recording and compression to optimize file sizes while maintaining quality for AI analysis:

- **Stream Optimization**: Before recording begins, video streams are optimized with reduced resolution (960x540), lower frame rate (10 fps), and aggressive encoding parameters
- **In-Browser Processing**: Video is recorded using the `MediaRecorder` API with optimized codec selection (vp9 with opus audio when available)
- **Post-Recording Compression**: After recording, videos undergo additional processing to further reduce file size
- **Upload Optimization**: Compressed videos are efficiently uploaded to Supabase storage with metadata tracking

This multi-stage approach ensures recordings are small enough for efficient storage and AI processing while maintaining sufficient quality for accurate skill assessment.

---

## Folder Structure

Below is the project structure using Next.js App Router:

```bash
verbo/
├─ .env # Environment variables (DB connections, API keys)
├─ prisma/
│  ├─ schema.prisma # Database schema
│  ├─ data/ # Seed data including skills taxonomy
│  └─ migrations/ # Database migrations
├─ src/
│  ├─ app/ # Next.js App Router pages
│  │  ├─ api/ # API routes
│  │  │  ├─ trpc/[trpc]/ # tRPC handler
│  │  │  └─ webhooks/ # External service webhooks (Clerk)
│  │  ├─ recruiter/ # Recruiter dashboard and features
│  │  ├─ candidate/ # Candidate assessment interface
│  │  ├─ sign-in/ # Clerk authentication pages
│  │  ├─ sign-up/ # Clerk authentication pages
│  │  ├─ layout.tsx # Root layout
│  │  └─ page.tsx # Landing page
│  ├─ components/ # React components
│  │  ├─ ui/ # shadcn/ui components
│  │  └─ magicui/ # Magic UI custom components
│  ├─ lib/ # Utility functions and shared logic
│  │  ├─ gemini/ # Google AI integration
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

- **Google AI API Key** for Gemini AI integration
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
   # Prisma - Supabase connection URLs
   # Connection pooling for normal operations
   DATABASE_URL="postgresql://postgres:password@host:port/database?pgbouncer=true"
   # Direct connection for migrations
   DIRECT_URL="postgresql://postgres:password@host:port/database"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY=""
   SUPABASE_SERVICE_ROLE_KEY=""

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
   CLERK_SECRET_KEY=""
   CLERK_WEBHOOK_SECRET=""

   # Google AI
   GOOGLE_AI_API_KEY=""

   # Node Environment
   NODE_ENV="development"
   ```

4. **Set Up the Database & Storage**  

   a. First, make sure your Supabase project is properly configured
   
   b. Set up storage buckets and policies in Supabase:

   ```bash
   npm run setup-supabase-storage
   ```

   c. Set up recording tables in Supabase:

   ```bash
   npm run setup-supabase-recording
   ```

   d. Run Prisma migrations to set up your database schema:

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed the database with initial data including skills taxonomy
   npx prisma db seed
   ```

   e. (Optional) View your database with Prisma Studio:

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

   - If you get AI integration errors:
     - Check your Google AI API key
     - Verify the API key has access to Gemini 2.0 Flash Thinking

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

The app is deployed on [Vercel](https://vercel.com), and you can access the live version at [verbo-alpha.vercel.app](https://verbo-alpha.vercel.app/).

For deploying your own instance:

1. Set up a Vercel account and connect your repository
2. Configure the environment variables in Vercel's dashboard
3. Deploy the application

---

## Color Palette

verbo.ai uses a custom color palette defined in `tailwind.config.ts` under the 'verbo' namespace:

- **verbo-green**: #73ea91 - Primary action, success states
- **verbo-purple**: #872ce5 - Accent color, highlights
- **verbo-blue**: #53a1e8 - Secondary actions, information
- **verbo-dark**: #321864 - Text, headers, primary brand color

These colors can be used with Tailwind classes like `text-verbo-dark` or `bg-verbo-purple` and support opacity modifiers.
