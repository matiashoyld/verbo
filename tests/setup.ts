import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from '@jest/globals';
import { server } from './mocks/server';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    isFallback: false,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test_key',
  CLERK_SECRET_KEY: 'test_secret',
  GOOGLE_AI_API_KEY: 'test_gemini_key',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test_supabase_key',
};

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    isLoaded: true,
    isSignedIn: true,
    getToken: jest.fn().mockResolvedValue('test-token'),
  }),
  ClerkProvider: ({ children }: { children: any }) => children,
  SignIn: () => 'Sign In Component',
  SignUp: () => 'Sign Up Component',
  UserButton: () => 'User Button',
}));

// Mock Prisma client
jest.mock('~/server/db', () => ({
  db: {
    position: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    skill: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    competency: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    commonPosition: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

// Mock Google Generative AI
jest.mock('~/lib/gemini/client', () => ({
  model: {
    generateContent: jest.fn(),
  },
}));

// Mock superjson
jest.mock('superjson', () => ({
  default: {
    stringify: (obj: any) => JSON.stringify(obj),
    parse: (str: string) => JSON.parse(str),
  },
}));

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Suppress console errors in tests unless needed
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};