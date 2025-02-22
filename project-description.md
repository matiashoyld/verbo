# verbo.ai  

**High-Level Description:**  
A skill assessment platform for modern hiring and recruitment processes. Recruiters select specific technical or soft skills they want to evaluate, and applicants are presented with an interactive case or challenge. Instead of a human interviewer, an AI agent guides the applicant, records both audio and screen activity, and at the end provides feedback to the applicant. For the recruiter, verbo.ai automatically extracts evidence of each skill from the recorded session and offers an AI-powered assessment and summary, drastically reducing the manual overhead of live interviews.

---

## 1. Core Objectives

1. **Accurate Skill Measurement**: Provide recruiters with an AI-driven breakdown of a candidate’s proficiency in targeted skills.  
2. **Efficient Evaluation Process**: Automate the interview process to save time and resources while keeping the assessment consistent.  
3. **Actionable Feedback**: Offer immediate insights and personalized feedback to applicants, helping them identify areas for improvement.  
4. **Scalable & Flexible Architecture**: Enable seamless onboarding of new skills or use cases (e.g., coding challenges, design critiques, communication assessments).

---

## 2. Use Cases & User Journeys

1. **Recruiter Onboarding / Setup**  
   - The recruiter creates an account on verbo.ai.  
   - The recruiter configures a new hiring pipeline, selecting one or multiple skills to assess (e.g., data structures, system design, product thinking, communication).  
   - The recruiter sets up or customizes scenario-based challenges for each skill.

2. **Applicant Interaction**  
   - The applicant receives an invitation link.  
   - Upon opening the link, the AI greets them, explains the challenge, and starts recording audio (and optionally screen activity).  
   - The AI asks clarifying questions, collects the applicant’s spoken or on-screen work-in-progress, and monitors key interactions.

3. **Automated Assessment & Feedback**  
   - Once the applicant finishes, verbo.ai processes the recorded session:  
     - **Audio-to-text** transcription for voice responses.  
     - **Screen capture** analysis for relevant solution steps.  
     - **AI skill inference** to map evidence of competencies or weaknesses.  
   - Applicants receive a summary of their performance, highlighting strong points and suggestions for improvement.

4. **Recruiter Dashboard & Review**  
   - The recruiter logs into the dashboard to see aggregated analytics and skill-specific assessments for each candidate.  
   - The platform highlights notable moments in the recording (e.g., hesitation, confusion, strong explanation).  
   - Recruiters can quickly deep-dive into any candidate’s submission to see transcripts, screen recordings, and AI annotations.

5. **Reporting & Analytics**  
   - verbo.ai generates visual dashboards showing how candidates scored across various skills.  
   - Recruiters can compare candidates, filter by skill, or identify strong applicants to move forward in the hiring pipeline.

---

## 3. Key Functionalities

1. **User Management & Authentication**  
   - Account creation for recruiters and applicants via Supabase.  
   - Role-based access control (recruiter vs. candidate).  
   - Secure sign-up/in, password reset, and session management.

2. **Challenge / Skill Setup**  
   - Recruiters define challenges (coding tasks, case studies, design tasks, etc.) and tag them with one or more skills.  
   - Optionally integrate AI (via Vercel AI SDK) to generate challenge prompts dynamically based on skill tags.  
   - Flexible instructions (text, attachments, or external links).

3. **Audio & Screen Recording**  
   - In-browser recording of audio and screen (with user consent).  
   - Real-time or asynchronous upload of the recordings to Supabase storage.  
   - Error handling and fallback mechanisms to ensure minimal data loss.

4. **Speech-to-Text & Analysis**  
   - Transcription powered by an LLM or external service (wrapped via Vercel AI SDK).  
   - Multilingual support where needed.  
   - Sentiment and clarity checks for communication-focused challenges.

5. **AI-Driven Skill Assessment**  
   - Use the Vercel AI SDK to parse transcripts and screen interactions for specific skill indicators.  
   - Provide a confidence score or rating for each skill.  
   - Generate bullet-point “evidence” references (e.g., “Successfully utilized an algorithmic approach to reduce time complexity”).

6. **Feedback to Applicants**  
   - Automatic summary of strengths and areas of improvement.  
   - Option for recruiters to add manual feedback or clarifications.  
   - Modular feedback templates to standardize communications.

7. **Reporting & Analytics Dashboard**  
   - Recruiters see a consolidated view of candidates and their skill performance.  
   - Filter by skill, challenge type, or date range.  
   - Exportable reports (PDF, CSV) for internal record-keeping.

8. **Security & Compliance**  
   - Store recordings securely in Supabase.  
   - Follow data privacy guidelines (e.g., GDPR).  
   - Clearly communicate user consent for recording.

9. **Scalability & Performance**  
   - Efficient streaming and uploading of audio/video to handle multiple parallel interviews.  
   - Potential use of edge caching/CDN for quick playback of recordings.  
   - Horizontal scaling for LLM-based analyses.

10. **UI/UX**  

- Responsive design using Tailwind CSS and shadcn/ui components.  
- Clean navigation, focusing on clarity for both recruiters (dashboard) and candidates (challenge view).  
- Accessibility best practices (WCAG compliance, ARIA labels, etc.).

---

## 4. Tech Stack

- **Front-End:**  
  - **Next.js** – React-based framework with server-side rendering support.  
  - **Tailwind CSS** – Utility-first CSS for rapid UI development.  
  - **shadcn/ui** – Pre-built, accessible UI components based on Tailwind CSS.

- **Back-End:**  
  - **TypeScript** – Type-safe development experience.  
  - **tRPC** – End-to-end type-safe APIs, seamlessly connecting front-end to back-end.  
  - **Prisma** – Type-safe ORM for database interaction.  
  - **Supabase** – Postgres-based managed database, plus authentication and file storage.  
  - **Vercel AI SDK** – Toolkit for integrating LLM functionality and streaming AI responses.

- **Additional Services / Tools:**  
  - **Supabase** (Authentication, database, storage for recordings).  
  - **Deployment**: Vercel (for Next.js hosting and serverless functions).

---

## 5. Suggested File/Folder Structure

```bash
verbo-ai/
├─ .env                     # Environment variables (Supabase keys, AI keys, etc.)
├─ .eslintrc.js            # Linting configuration
├─ .prettierrc             # Prettier configuration
├─ package.json
├─ prisma/
│  ├─ schema.prisma        # Prisma schema (User, Skill, Challenge, Submission, etc.)
├─ src/
│  ├─ pages/
│  │  ├─ api/
│  │  │  └─ trpc/          # tRPC Next.js API routes (if using that pattern)
│  │  ├─ index.tsx         # Landing page / marketing
│  │  ├─ recruiter/
│  │  │  ├─ dashboard.tsx  # Recruiter dashboard (analytics, candidate overview)
│  │  │  ├─ challenges.tsx # Page to create & manage challenges/skills
│  │  │  └─ ...
│  │  ├─ candidate/
│  │  │  ├─ index.tsx      # Candidate home (list of assigned challenges)
│  │  │  ├─ challenge/[id].tsx  # Challenge detail & recording interface
│  │  │  └─ ...
│  │  └─ ...
│  ├─ server/
│  │  ├─ trpc/
│  │  │  ├─ index.ts       # tRPC router
│  │  │  ├─ user.ts        # tRPC procedures for user management
│  │  │  ├─ challenge.ts   # tRPC procedures for challenges
│  │  │  ├─ submission.ts  # tRPC procedures for submissions/recordings
│  │  │  └─ ...
│  │  ├─ db.ts             # Prisma client
│  ├─ components/          # Shared UI components
│  │  ├─ ui/
│  │  │  ├─ Button.tsx
│  │  │  ├─ Modal.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  └─ ...
│  ├─ lib/
│  │  ├─ supabase.ts       # Supabase client config
│  │  ├─ ai.ts             # Vercel AI SDK integration & utilities
│  │  └─ recording.ts      # Helper for screen/audio recording
│  ├─ styles/
│  │  └─ globals.css       # Tailwind CSS imports & global styles
├─ tsconfig.json
└─ README.md
```

---

## 6. Additional Considerations

1. **Environment Configuration**  
   - Store Supabase keys and any AI API keys in `.env`.  
   - Separate dev/prod environment variables for safety.

2. **Scalability & Performance**  
   - Utilize Supabase’s built-in storage and Postgres for large volumes of recordings.  
   - Implement concurrency strategies (e.g., background processing of lengthy video segments).  
   - Use caching for repeated AI inferences, to reduce cost and latency.

3. **Data Privacy & Consent**  
   - Clearly inform applicants about audio and screen recording.  
   - Provide an explicit consent flow before the challenge begins.  
   - Make sure to handle PII in compliance with relevant regulations (GDPR, etc.).

4. **Cost Management**  
   - Monitor AI usage (transcription, skill analysis) and set usage limits.  
   - Consider streaming or chunked transcriptions to reduce overhead.  
   - Evaluate whether to store only essential parts of the recordings or shortened highlight reels.

5. **Testing**  
   - Unit tests for core components.  
   - Integration tests for tRPC procedures and database interactions.  
   - E2E tests (e.g., Playwright or Cypress) to simulate the recruiter and candidate flows.

6. **Accessibility**  
   - Provide transcripts of audio for hearing-impaired users.  
   - Ensure the screen recording process is properly explained and controlled.  
   - Maintain keyboard and screen reader compatibility.

7. **Internationalization**  
   - If required, consider i18n frameworks like [`next-i18next`](https://github.com/isaachinman/next-i18next).  
   - Offer AI-driven translation of instructions/challenges if serving a global user base.

8. **Extension Hooks**  
   - Corporate SSO or enterprise identity systems.  
   - Integration with ATS (Applicant Tracking Systems) via an API or webhook.  
   - Additional AI modules (e.g., code analysis, design artifact analysis).

---

## 7. Instructions for the AI IDE

1. **Initialize a Next.js + TypeScript project** with the recommended structure.  
2. **Install dependencies** for Tailwind CSS, tRPC, Prisma, Supabase, shadcn/ui, and the Vercel AI SDK.  
3. **Configure Supabase**:  
   - Create a new project on [Supabase](https://supabase.com/).  
   - Copy the project URL and anon/public keys into your `.env`.  
   - Use Supabase’s Auth for user sign-up/in flows.  
   - Set up storage buckets for audio/video recordings.  

4. **Set up Prisma**:  
   - Define your database schema in `prisma/schema.prisma` (e.g., `User`, `Skill`, `Challenge`, `Submission`).  
   - Generate and migrate your database.  
   - Integrate the Prisma client in `db.ts`.  

5. **Configure tRPC**:  
   - Create your main router in `src/server/trpc/index.ts`.  
   - Add child routers (e.g., `challenge.ts`, `submission.ts`) for your domain logic.  
   - Ensure type-safety from front-end to back-end.  

6. **Integrate the Vercel AI SDK**:  
   - In `lib/ai.ts`, configure your AI model(s).  
   - Implement skill analysis or transcription endpoints using `ai` utilities.  
   - Consider streaming or chunk-based approaches for large audio recordings.

7. **Build the Recording Interfaces**:  
   - Implement screen + audio capture logic in `lib/recording.ts`.  
   - Create a front-end component or hook to manage the recording lifecycle.  
   - Upload the finalized recordings to Supabase storage upon completion.  

8. **Develop Key Pages**:  
   - **Landing**: Quick overview and sign-up entry.  
   - **Recruiter Dashboard**: Summaries of active challenges, candidate progress, analytics.  
   - **Challenges Management**: Pages for creating/editing skill challenges.  
   - **Candidate Challenge**: Rich UI for instructions + AI chat + recording.  

9. **Add Testing & QA**:  
   - Use your preferred testing frameworks (e.g., Jest for unit tests, Cypress for E2E).  
   - Validate correct data flow, from uploading a challenge to final AI assessment.  

10. **Deploy to Vercel**:  

- Connect your Git repo to Vercel.  
- Configure environment variables in Vercel’s dashboard.  
- Test live to ensure that Supabase integration, recordings, and AI features work as expected.  

With these steps, verbo.ai will evolve into a robust, scalable platform, streamlining skill assessments and generating actionable insights for recruiters—all while offering immediate feedback and guidance to applicants.
