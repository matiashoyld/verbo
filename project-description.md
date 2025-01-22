**Project Name:** verbo.ai  
**High-Level Description:**  
A voice-based reading reflection platform that promotes authentic student engagement by requiring spoken responses to reading assignments. Professors can upload reading materials, create or customize comprehension questions, and receive valuable insights into student performance through automated transcription, analytics, and feedback tools. By focusing on spoken responses instead of written submissions, verbo.ai helps mitigate the issue of AI-generated text content and restores genuine learning interactions.

---

### 1. Core Objectives

1. **Authentic Engagement**: Students respond verbally to questions, encouraging spontaneous and genuine answers.  
2. **Real-Time Analysis**: Speech-to-text processing with immediate feedback for both students and professors.  
3. **Insights & Analytics**: Professors gain visibility into common areas of confusion or misunderstanding.  
4. **Scalability & Efficiency**: Architecture supporting potential expansion to K-12 or corporate training programs.

---

### 2. Use Cases & User Journeys

1. **Professor Onboarding / Setup**  
   - The professor logs in or creates an account.  
   - The professor uploads reading materials (PDF, text, or other formats).  
   - The platform processes the document to prepare for question generation or manual question input.

2. **Question Creation / Customization**  
   - The professor either auto-generates questions based on the uploaded reading using an NLP model or manually creates questions.  
   - The professor can edit or refine these questions, set due dates, and publish them to a course or specific student group.

3. **Student Reading & Response**  
   - The student logs in and views assigned readings/questions.  
   - The student records a voice response.  
   - The system transcribes the response in real-time, displaying a transcript and basic feedback.

4. **Professor Dashboard & Feedback**  
   - After students submit responses, the professor can review transcripts, listen to recordings, and see aggregated analytics (e.g., average response length, sentiment, key topics mentioned).  
   - The system flags low-confidence or unclear responses for manual review.  
   - The professor can provide additional feedback, annotate the student's transcript, or address misunderstandings in class.

5. **Analytics & Reporting**  
   - The platform generates visual reports (charts, metrics) showing class-wide performance, common errors, or areas of misunderstanding.  
   - Professors use these insights to tailor subsequent lessons or interventions.

---

### 3. Key Functionalities

1. **User Management & Authentication**  
   - Account creation for professors and students using Clerk
   - Secure sign-in with multiple authentication methods (email, OAuth providers)
   - Role-based access control (professor, student, admin)
   - User profile management and settings
   - Session management and security features

2. **Reading Material Upload & Storage**  
   - Ability to upload PDFs or text files.  
   - Storage via a cloud service (e.g., AWS S3) or local storage for dev.  
   - Document parsing or extraction for question generation (optional).

3. **Question Generation & Management**  
   - Basic NLP-based question generation from the text using AI SDK Core for LLM integration
   - Manual question creation for precise control  
   - Question editing and publishing workflow
   - Structured data generation for question types using AI SDK's object generation

4. **Speech-to-Text Integration**  
   - Students record verbal responses using the browser's MediaRecorder API
   - Audio processing and conversion to MP3 format using ffmpeg
   - Real-time transcription using OpenAI's Whisper API
   - Support for multiple languages or dialects (leveraging Whisper's multilingual capabilities)
   - Fallback to Web Speech API for development/testing

5. **Analytics & Feedback**  
   - Dashboard showing response metrics: word count, confidence scores, sentiment analysis
   - AI-powered insights using AI SDK Core for analyzing student responses
   - Aggregated class or group statistics for professors
   - Automatic feedback highlights unclear sections of audio or incomplete answers
   - Option for professors to leave manual feedback or written comments

6. **Security & Privacy**  
   - Handling sensitive data (student responses, transcripts) securely.  
   - Consider encryption for audio files, transcripts, and logs.  
   - Ensure compliance with institutional privacy regulations (e.g., FERPA in the U.S.).

7. **UI/UX**  
   - Clean, minimalistic front-end using Tailwind CSS and shadcn UI components.  
   - Responsive design for desktop and mobile.  
   - Emphasis on accessibility (e.g., text contrast, ARIA labels, keyboard navigation).

---

### 4. Tech Stack

- **Front-End:**  
  - [Next.js](https://nextjs.org/) (React-based framework for server-rendered or static web apps)  
  - [Tailwind CSS](https://tailwindcss.com/) (utility-first CSS framework)  
  - [shadcn/ui](https://ui.shadcn.com/) (pre-built Tailwind-based UI components)

- **Back-End:**  
  - [TypeScript](https://www.typescriptlang.org/) (type-safe development)  
  - [tRPC](https://trpc.io/) (end-to-end type-safe APIs)  
  - [Prisma](https://www.prisma.io/) (type-safe ORM for database interactions)  
  - [Neon](https://neon.tech) (serverless PostgreSQL database)
  - [Vercel AI SDK](https://sdk.vercel.ai/) (TypeScript toolkit for AI features)
  - [OpenAI Whisper](https://openai.com/research/whisper) (for accurate speech-to-text transcription)

- **Additional Services / Tools:**  
  - [ffmpeg](https://ffmpeg.org/) (for audio processing and conversion)
  - [Clerk](https://clerk.com) (authentication and user management)
  - Testing: Jest / React Testing Library / Cypress (for E2E)  
  - Deployment: [Vercel](https://vercel.com) (for hosting the Next.js application)

---

### 5. Suggested File/Folder Structure

A structure aligned with a typical T3 stack + Next.js project might look like this:

```
verbo-ai/
├─ .env                      # Environment variables (DB connections, API keys)
├─ .eslintrc.js             # Linting configuration
├─ .prettierrc              # Prettier configuration
├─ package.json             
├─ prisma/
│  ├─ schema.prisma         # Prisma schema for database models
├─ src/
│  ├─ pages/                # Next.js pages
│  │  ├─ api/
│  │  │  └─ trpc/           # (If you're exposing tRPC through Next's API routes)
│  │  ├─ index.tsx          # Landing page / marketing site
│  │  ├─ dashboard.tsx      # Professor's main dashboard
│  │  ├─ student/
│  │  │  ├─ index.tsx       # Student landing / dashboard
│  │  │  ├─ responses.tsx   # Page for recording/listening to responses
│  │  └─ ...
│  ├─ server/
│  │  ├─ trpc/
│  │  │  ├─ index.ts        # tRPC router entry
│  │  │  ├─ questions.ts    # tRPC router for question endpoints
│  │  │  ├─ readings.ts     # tRPC router for reading materials
│  │  │  └─ users.ts        # tRPC router for user management
│  │  ├─ db.ts              # Prisma client instance
│  ├─ components/           # Reusable UI components
│  │  ├─ ui/
│  │  │  ├─ Button.tsx
│  │  │  ├─ Input.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  └─ ...
│  ├─ lib/                  # Utility functions, helpers
│  │  └─ speechToText.ts    # Abstraction for speech-to-text logic
│  ├─ styles/
│  │  └─ globals.css        # Tailwind CSS imports, global styles
├─ tsconfig.json
└─ README.md
```

#### Pages & Components to Implement

- **Landing Page (`/pages/index.tsx`)**  
  - Overview of verbo.ai, sign-in / sign-up buttons.

- **Professor Dashboard (`/pages/dashboard.tsx`)**  
  - List of courses / reading assignments.  
  - Buttons to create or upload new reading assignments.  
  - Quick analytics snapshot (e.g., average completeness).

- **Reading Upload / Creation Page**  
  - Form to upload a file (PDF, text, etc.).  
  - Option to manually input text or link to external source.

- **Question Management Page**  
  - View, edit, and create questions for a particular reading.  
  - Toggle auto-generated questions or manual creation.

- **Student Dashboard (`/pages/student/index.tsx`)**  
  - List of assigned readings with due dates.  
  - Progress indicators for completed vs. pending tasks.

- **Response Recording Page (`/pages/student/responses.tsx`)**  
  - Audio recorder interface.  
  - Real-time transcription display.  
  - Submit or re-record functionality.

- **Analytics & Feedback Page**  
  - Detailed overview of student transcripts.  
  - Insights (e.g., average response length, sentiment analysis).  
  - Professor feedback and comments.

- **Reusable Components**  
  - Navbar, Sidebar, Cards, Modals, Form Inputs, Buttons, etc. (Utilizing [shadcn/ui](https://ui.shadcn.com/)).

---

### 6. Additional Considerations

1. **Environment Configuration**  
   - `.env` file for Neon database credentials, OpenAI API keys, Clerk secrets, etc.
   - Configure separate Neon database branches for development/staging/production
   - Set up proper API key management for OpenAI services
   - Configure Clerk authentication settings and environments

2. **Scalability & Performance**  
   - Leverage Neon's auto-scaling capabilities for database performance
   - Use Vercel Edge Functions and Edge Config for optimal global performance
   - Implement caching for frequently accessed data (e.g., reading materials, previous analytics)  
   - Handle audio file storage (consider Vercel Blob Storage or AWS S3) and optimize large file uploads
   - Consider rate limiting for Whisper API calls to manage costs

3. **Testing**  
   - Unit tests for components (React Testing Library).  
   - Integration tests for tRPC routes.  
   - E2E tests (Cypress) to simulate full user flow (upload reading, create question, student responds, professor reviews).

4. **Accessibility**  
   - Ensure that the interface is keyboard-accessible.  
   - Provide text transcripts alongside audio for compliance and universal access.

5. **Internationalization (Optional)**  
   - If supporting multiple languages, consider i18n (e.g., [next-i18next](https://github.com/isaachinman/next-i18next)).

6. **Documentation**  
   - Maintain up-to-date docs or a README for contributors.  
   - Write usage guides for professors and students.  
   - Provide code-level documentation for critical functions (speechToText logic, question generation, etc.).

7. **AI Integration**
   - Use AI SDK Core for all LLM interactions (question generation, analysis)
   - Implement AI SDK UI components for real-time streaming responses
   - Consider using AI SDK's structured data generation for consistent question formats
   - Set up proper error handling for AI-related operations
   - Implement middleware for rate limiting and usage tracking of AI features

8. **Audio Processing & Transcription**
   - Implement proper audio format conversion pipeline (WebM/WAV to MP3)
   - Set up error handling for failed transcriptions
   - Cache transcription results to avoid redundant API calls
   - Implement progress indicators during transcription
   - Consider batch processing for longer audio files
   - Monitor and optimize Whisper API usage and costs

9. **Authentication & Authorization**
   - Set up Clerk middleware for protected routes
   - Configure user roles and permissions
   - Implement organization/team management for classes
   - Set up OAuth providers for institutional logins
   - Implement proper session handling and security
   - Monitor and analyze auth metrics through Clerk dashboard

---

### 7. Instructions for the AI IDE

- **Generate an initial Next.js + TypeScript project** with the above folder structure in mind
- **Install and configure** Tailwind CSS, tRPC, Prisma, shadcn/ui, and Vercel AI SDK
- **Set up Neon database connection** and configure Prisma to work with it
- **Configure Vercel deployment** settings and environment variables
- **Create skeleton pages** for each of the major routes (dashboard, student, question management, etc.)
- **Implement a basic authentication flow** (NextAuth or a similar solution) to differentiate professor vs. student experiences
- **Scaffold database models** with Prisma for Users, Readings, Questions, and Responses
- **Add stubs** for the main tRPC procedures (e.g., `questions.create()`, `readings.upload()`, `responses.submit()`), including typing with TypeScript
- **Set up AI SDK Core and UI components** for:
  - Question generation from reading materials
  - Real-time transcription and feedback
  - Structured data generation for analytics
- **Optionally** include a minimal speech-to-text example component using the Web Speech API to demonstrate how audio capture and transcription might be handled
- **Set up audio processing pipeline:**
  - Install and configure ffmpeg for audio conversion
  - Implement MediaRecorder setup for audio capture
  - Create audio processing utilities for format conversion
  - Set up Whisper API integration for transcription
  - Implement proper error handling and retry logic
- **Set up authentication:**
  - Install and configure Clerk SDK
  - Set up authentication middleware
  - Create protected routes and API endpoints
  - Configure user roles and permissions
  - Implement sign-in/sign-up flows
  - Add organization/team management for classes

Please proceed with scaffolding the project structure, pages, and initial components based on the above specifications. Focus on maintainable, type-safe code and a clean, intuitive user experience.
