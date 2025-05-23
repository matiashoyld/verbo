import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';
import HomePage from '~/app/page';
import { api } from '~/trpc/react';

// Mock Clerk auth
jest.mock('@clerk/nextjs');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock tRPC
jest.mock('~/trpc/react', () => ({
  api: {
    user: {
      getUserRole: {
        useQuery: jest.fn(),
      },
    },
  },
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockApiQuery = api.user.getUserRole.useQuery as jest.MockedFunction<
  typeof api.user.getUserRole.useQuery
>;

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
        sessionId: null,
        getToken: jest.fn(),
      } as any);
    });

    test('renders marketing page for unauthenticated users', () => {
      render(<HomePage />);

      expect(screen.getByText('AI-Powered Skill Assessments')).toBeInTheDocument();
      expect(screen.getByText('for Modern Hiring')).toBeInTheDocument();
      expect(screen.getByText('Now in private beta')).toBeInTheDocument();
    });

    test('shows get started button', () => {
      render(<HomePage />);

      const getStartedButtons = screen.getAllByText('Get Started');
      expect(getStartedButtons.length).toBeGreaterThan(0);
    });

    test('displays feature cards', () => {
      render(<HomePage />);

      expect(screen.getByText('Realistic Challenges')).toBeInTheDocument();
      expect(screen.getByText('AI-Guided Interviews')).toBeInTheDocument();
      expect(screen.getByText('Time Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Candidate Insights')).toBeInTheDocument();
    });

    test('shows call-to-action section', () => {
      render(<HomePage />);

      expect(screen.getByText('Ready to transform your hiring process?')).toBeInTheDocument();
      expect(screen.getByText('Get Started Now')).toBeInTheDocument();
    });
  });

  describe('Authenticated User - Loading State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        sessionId: 'test-session',
        getToken: jest.fn(),
      } as any);

      mockApiQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      } as any);
    });

    test('shows loading dashboard when user data is loading', () => {
      render(<HomePage />);

      expect(screen.getByText('Loading your workspace...')).toBeInTheDocument();
    });
  });

  describe('Authenticated User - Recruiter', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        sessionId: 'test-session',
        getToken: jest.fn(),
      } as any);

      mockApiQuery.mockReturnValue({
        data: { role: 'RECRUITER' },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);
    });

    test('renders recruiter dashboard for recruiter users', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Total Challenges')).toBeInTheDocument();
        expect(screen.getByText('Active Submissions')).toBeInTheDocument();
        expect(screen.getByText('Completed Assessments')).toBeInTheDocument();
        expect(screen.getByText('Average Score')).toBeInTheDocument();
      });
    });

    test('shows recruiter navigation items', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Skills')).toBeInTheDocument();
        expect(screen.getByText('Positions')).toBeInTheDocument();
        expect(screen.getByText('Submissions')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });

    test('displays dashboard cards with correct values', async () => {
      render(<HomePage />);

      await waitFor(() => {
        // Check for the dashboard cards
        const challengeCards = screen.getAllByText('0');
        expect(challengeCards.length).toBeGreaterThanOrEqual(3); // Total Challenges, Active Submissions, Completed Assessments

        expect(screen.getByText('N/A')).toBeInTheDocument(); // Average Score
      });
    });
  });

  describe('Authenticated User - Candidate', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        sessionId: 'test-session',
        getToken: jest.fn(),
      } as any);

      mockApiQuery.mockReturnValue({
        data: { role: 'CANDIDATE' },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);
    });

    test('renders candidate dashboard for candidate users', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('My Challenges')).toBeInTheDocument();
        expect(screen.getByText('No challenges yet')).toBeInTheDocument();
        expect(screen.getByText('Your assigned challenges will appear here')).toBeInTheDocument();
      });
    });

    test('shows candidate navigation items', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('My Challenges')).toBeInTheDocument();
        expect(screen.getByText('Past Submissions')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });
    });
  });

  describe('Auth Loading State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        userId: null,
        sessionId: null,
        getToken: jest.fn(),
      } as any);
    });

    test('shows marketing page when auth is still loading', () => {
      render(<HomePage />);

      // Should show marketing page when auth is not loaded yet
      expect(screen.getByText('AI-Powered Skill Assessments')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        sessionId: 'test-session',
        getToken: jest.fn(),
      } as any);
    });

    test('shows loading dashboard when user role is unknown', async () => {
      mockApiQuery.mockReturnValue({
        data: { role: 'UNKNOWN_ROLE' as any },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Loading your workspace...')).toBeInTheDocument();
      });
    });

    test('shows loading dashboard when query fails', async () => {
      mockApiQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch user role'),
        refetch: jest.fn(),
      } as any);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Loading your workspace...')).toBeInTheDocument();
      });
    });
  });
});