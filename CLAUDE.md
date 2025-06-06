# Claude Memory for Verbo Project

## Project Overview
**Name**: Verbo - AI-Powered Technical Interview Platform  
**Type**: T3 Stack Application  
**Owner**: Matias (@matiashoyld)  
**Repository**: https://github.com/matiashoyld/verbo  
**Current Status**: 🚧 **Major Transformation In Progress** - Converting from recruiter-managed to candidate self-service platform

## What Verbo Does
AI-powered technical assessment platform currently being transformed from recruiter-managed to candidate self-service:

### Current Flow (Being Replaced)
1. **Recruiter Creates Account** → Uses position creation wizard
2. **Job Description Input** → Select predefined roles or custom descriptions
3. **AI Skills Extraction** → Gemini extracts relevant skills and competencies
4. **Assessment Generation** → AI creates technical case and questions
5. **Link Sharing** → Recruiter shares candidate link
6. **Candidate Assessment** → Video-based technical interview submission
7. **AI Analysis** → Video processing and skill evaluation

### Target Flow (Epic #1 Implementation)
1. **Candidate Creates Account** → Direct self-service onboarding
2. **Assessment Creation** → Candidates use same creation wizard (job desc → skills → questions)
3. **Direct Submission** → Immediate transition to assessment without recruiter dependency
4. **Results & Feedback** → Complete end-to-end candidate experience

## Tech Stack & Architecture

### Core Framework
- **Next.js 14.2.5** with App Router, **TypeScript**, **React 18**, **tRPC v10**

### Key Services
- **Clerk** for authentication (CANDIDATE/RECRUITER roles)
- **Supabase** PostgreSQL + **Prisma** ORM
- **Gemini 2.5** Flash/Pro for AI processing (skills extraction, case generation, video analysis)
- **MediaRecorder API** for screen/audio capture with cross-browser support
- **Shadcn/ui** + **Tailwind CSS** for UI components
- **Vercel** for deployment

### Database Schema (Prisma)
- **Users**: Clerk integration with role-based access (RECRUITER/CANDIDATE)
- **Positions**: Job descriptions with AI-generated assessments
- **Skills Taxonomy**: 22 predefined positions, hierarchical skills/competencies
- **Assessments**: Video recordings with AI analysis and competency scoring

## Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run typecheck` - TypeScript checking  
- `npm run lint` - ESLint checking
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npx prisma db push` - Push schema to database
- `npx prisma studio` - Database management UI
- `./start-database.sh` - Start local Supabase instance

## Development Guidelines
- **Component Reusability** - Existing components (JobDescriptionStep, SkillsStep, AssessmentStep) are well-designed and should be reused
- **Type Safety First** - Strong TypeScript usage throughout
- **Candidate-First Design** - All new development should prioritize candidate self-service experience
- **AI Integration** - Leverage existing Gemini integration for skills extraction and case generation
- **Testing Before Deployment** - Comprehensive testing framework already in place
- **Conventional Commits** - Use format: `type(scope): short description`
- **NO Claude attribution** - Do not add "Generated with Claude Code" or "Co-Authored-By: Claude" to commits or PRs
- **NO secrets in PRs** - Never include actual secrets, tokens, or API keys

## 🚧 Current Transformation Status (Epic #1)

### Epic: Transform Platform to Candidate Self-Service
**GitHub Issues Created**: 7 comprehensive issues (#1-#7)  
**Status**: Planning complete, implementation pending  
**Priority**: High - Major architectural change affecting core user experience

### Issue Breakdown & Dependencies
1. **Issue #1**: Epic Overview - Master tracking issue
2. **Issue #2**: Authentication Updates - Change default role to CANDIDATE ⚠️ **START HERE**
3. **Issue #3**: Route Restructuring - Move /recruiter flows to /candidate namespace
4. **Issue #4**: Dashboard Transformation - Create candidate-focused landing experience
5. **Issue #5**: Position Creation Adaptation - Integrate existing wizard for candidates
6. **Issue #6**: Navigation & Middleware - Update routing logic for candidate-first experience
7. **Issue #7**: Testing & Documentation - Comprehensive validation and docs update

### Critical Implementation Notes
- **Sequential Dependencies**: Issues must be completed in order (#2 → #3 → #4 → #5 → #6 → #7)
- **Component Reuse**: JobDescriptionStep, SkillsStep, AssessmentStep work perfectly as-is
- **Database Changes**: Minimal - only default role change needed
- **API Changes**: tRPC procedures need access control updates, no major restructuring
- **Risk Level**: Low-Medium - Well-planned transformation with existing solid foundation

## Key Technical Architecture

### Authentication System (Clerk Integration)
**Current**: Default role RECRUITER, role-based middleware routing  
**Target**: Default role CANDIDATE, candidate-first routing logic  
**Files**: `src/middleware.ts`, `prisma/schema.prisma`, `src/server/api/routers/user.ts`

### Route Structure
**Current**:
- `/recruiter/positions` - Position creation and management
- `/candidate/position/[id]` - Assessment access via shared links
- Role-based middleware rewrites (`/positions` → `/recruiter/positions`)

**Target**:
- `/candidate/create-assessment` - Self-service assessment creation
- `/candidate/assessments` - Personal assessment management
- Direct flow from creation to submission

### Component Architecture (Ready for Reuse)
```bash
src/app/recruiter/positions/components/
├── JobDescriptionStep.tsx        # ✅ Perfect for candidate use
├── SkillsStep.tsx               # ✅ Skills extraction & modification  
├── AssessmentStep.tsx           # ✅ Question generation & customization
├── NewPositionDialog.tsx        # 🔄 Adapt to full-page experience
└── [Other components]           # Various UI components

src/app/candidate/position/[id]/
├── submission/                  # ✅ Complete submission flow (keep as-is)
├── results/                     # ✅ Results display (keep as-is)
└── live/                        # ✅ Live interview mode (keep as-is)
```

### AI Integration (Gemini)
**Skills Extraction**: `src/lib/gemini/extractSkills.ts` - Processes job descriptions  
**Case Generation**: `src/lib/gemini/generateCase.ts` - Creates assessment questions  
**Video Analysis**: `src/lib/gemini/analyzeVideo.ts` - Evaluates candidate responses  
**Status**: ✅ Production-ready, works perfectly for candidate self-service

### Database Schema Insights
- **22 Predefined Positions**: `prisma/data/common_positions.json` - Ready for candidate quick-start
- **Skills Taxonomy**: Hierarchical structure (Categories → Skills → Competencies)
- **User Roles**: RECRUITER/CANDIDATE with proper access control
- **Assessment Data**: Complete video recording and analysis pipeline

## tRPC API Structure

### Key Routers
- **positions**: Position CRUD, skills extraction, assessment generation
- **skills**: Skills taxonomy management
- **recordings**: Video upload and metadata management
- **submissions**: Assessment submission and analysis
- **user**: User role management and profile

### Critical Procedures for Transformation
- `positions.extractSkills` - AI-powered skills extraction from job descriptions
- `positions.generateAssessment` - AI case and question generation
- `positions.createPosition` - Assessment creation with competency mapping
- `positions.getCommonPositions` - Predefined role templates for quick start
- `user.updateUserToCandidate` - Role management (may need review)

### Access Control Updates Needed
- Change `extractSkills` from publicProcedure to protectedProcedure
- Add user filtering to `getPositions` for candidate-specific data isolation
- Ensure `createPosition` properly handles candidate creators

## Media Capture & Assessment System
**Status**: ✅ Production-ready with comprehensive browser support

### Recording Infrastructure
- **Cross-browser compatibility**: Chrome, Firefox, Safari, Edge
- **Recording types**: Screen-only, audio-only, screen+audio combined
- **Upload system**: Chunked uploads via tRPC with progress tracking
- **Video analysis**: AI-powered competency assessment with Gemini

### Key Components
- `RecordingUtils.ts` - Core recording functionality
- `UploadUtils.ts` - File upload and processing
- `VideoOptimizer.ts` - Browser-specific optimization
- `SkillExtractionLoading.tsx` - AI processing UI feedback

## Testing Framework
**Status**: ✅ Comprehensive test suite with 120+ tests

### Test Coverage
- **API Layer**: tRPC procedures, middleware, authentication
- **Components**: UI components, form validation, user interactions  
- **Integration**: Complete assessment flows, video recording
- **Utilities**: Cross-browser compatibility, error handling

### Test Commands
```bash
npm test                    # Run full test suite
npm run test:watch         # Watch mode for development
npm run test:coverage      # Coverage report
```

## Build & Deployment
**Status**: ✅ Production-ready deployment pipeline

### Build Process
- **Next.js 14**: Optimized production builds with static generation
- **TypeScript**: Strict mode with comprehensive type checking
- **ESLint**: Custom rules for tRPC patterns and React best practices
- **Vercel**: Automatic deployments on main branch

### Environment Variables
```bash
# Database
DATABASE_URL=                 # Supabase PostgreSQL connection
DIRECT_URL=                   # Direct database access

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY= # Gemini API for AI processing

# Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Troubleshooting Notes

### Transformation-Specific Issues
- **Role conflicts**: Ensure user role changes don't affect existing data
- **Route conflicts**: Test middleware routing with both old and new routes
- **Component integration**: Verify dialog components work in full-page layouts
- **AI service access**: Ensure all procedures have proper authentication

### Common Development Issues
- **Database connection**: Use `npx prisma studio` to verify schema and data
- **Auth issues**: Check Clerk configuration and callback URLs
- **AI rate limits**: Gemini API has rate limits - implement proper error handling
- **Video upload failures**: Check file size limits and network connectivity

### Build Issues
- **TypeScript errors**: Run `npm run typecheck` before building
- **ESLint violations**: Use `npm run lint` to catch code quality issues
- **Test failures**: Ensure all tests pass with `npm test` before deployment
- **Environment variables**: Verify all required env vars are set in deployment

### Performance Optimization
- **AI response times**: Skills extraction ~2-3s, case generation ~5-8s
- **Video processing**: Large files may need chunked upload optimization
- **Database queries**: Use proper indexing for user-specific data filtering
- **Bundle size**: Monitor bundle size during component restructuring

## Candidate Self-Service Implementation Guide

### Quick Start for Epic #1 Implementation

#### Phase 1: Authentication (Issue #2)
1. Update `prisma/schema.prisma` - change default role to CANDIDATE
2. Update `src/middleware.ts` - change default role logic
3. Test new user signup flow

#### Phase 2: Routes (Issue #3)  
1. Create `src/app/candidate/create-assessment/page.tsx`
2. Create `src/app/candidate/assessments/page.tsx`
3. Update middleware pathsToRewrite array

#### Phase 3: Dashboard (Issue #4)
1. Enhance CandidateDashboard in `src/app/page.tsx`
2. Create dashboard components (Hero, QuickStart, RecentAssessments)
3. Integrate with common_positions.json for quick start

#### Phase 4: Position Creation (Issue #5)
1. Adapt NewPositionDialog flow to full-page experience
2. Reuse existing step components unchanged
3. Add direct redirect to submission after creation

#### Phase 5: Navigation (Issue #6)
1. Update `src/middleware.ts` routing logic
2. Update navbar for candidate-first experience
3. Test all route protection and access control

#### Phase 6: Testing (Issue #7)
1. End-to-end testing of complete candidate flow
2. Regression testing of existing functionality
3. Update all documentation

### Key Design Principles for Implementation
- **Reuse over rebuild**: Existing components are production-ready
- **Candidate-first UX**: Every interaction should feel natural for self-service
- **Data isolation**: Ensure candidates only see their own assessments
- **Performance**: Maintain current AI response times and video upload speeds
- **Mobile-first**: Ensure responsive design throughout the transformation

### Success Metrics
- **Complete self-service flow**: Signup → Assessment Creation → Submission → Results
- **Zero recruiter dependency**: Candidates never need external sharing or setup
- **Preserved functionality**: All existing assessment and analysis features work
- **Improved UX**: Faster time-to-assessment for candidates
- **Maintained performance**: No degradation in AI processing or video handling

## Data Structure & Business Logic

### Skills Taxonomy (Production Data)
- **Categories**: 22 categories from Programming to Project Management
- **Skills**: 100+ specific technical skills mapped to categories
- **Competencies**: Detailed competency definitions with 5-level scoring
- **Mapping**: Complete numId system for AI service integration

### Assessment Generation Pipeline
1. **Job Description** → AI extracts relevant skills and competencies
2. **Skills Review** → Candidate modifies selected skills/competencies  
3. **Case Generation** → AI creates realistic technical scenarios and questions
4. **Question Customization** → Candidate can modify or add questions
5. **Assessment Creation** → Database record with all metadata
6. **Direct Submission** → Immediate transition to recording interface

### Video Analysis & Scoring
- **Recording**: Screen + audio capture with browser optimization
- **Processing**: Chunked upload with progress tracking
- **AI Analysis**: Gemini processes video for technical competency assessment
- **Scoring**: 5-level competency scoring with detailed feedback
- **Results**: Comprehensive skill breakdown with improvement recommendations

This transformation maintains all the sophisticated AI-powered assessment capabilities while removing friction and dependency on recruiters, creating a modern self-service platform for technical skill evaluation.