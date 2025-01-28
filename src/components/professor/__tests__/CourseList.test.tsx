import { render, screen } from "@testing-library/react"
import { CourseList } from "../CourseList"
import { api } from "~/utils/api"
import type { UseTRPCQueryResult } from "@trpc/react-query/shared"
import type { TRPCClientErrorLike } from "@trpc/client"
import type { Course } from "@prisma/client"
import { expect, vi, describe, it, beforeEach } from "vitest"

// Mock the tRPC API
vi.mock("~/trpc/react", () => ({
  api: {
    course: {
      getAll: {
        useQuery: vi.fn(),
      },
      create: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
    },
    useUtils: () => ({
      course: {
        getAll: {
          invalidate: vi.fn(),
        },
      },
    }),
  },
}))

// Mock the toast hook
vi.mock("~/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Create a wrapper component to provide necessary context
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

type CourseQueryResult = UseTRPCQueryResult<Course[], TRPCClientErrorLike<unknown>>

const mockCourseData: Course[] = [
  {
    id: "1",
    name: "Test Course 1",
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockQueryResult: CourseQueryResult = {
  data: mockCourseData,
  isLoading: false,
  error: null,
  isError: false,
  isFetching: false,
  refetch: vi.fn(),
} as CourseQueryResult

describe("CourseList", () => {
  beforeEach(() => {
    vi.mocked(api.course.getAll.useQuery).mockReturnValue(mockQueryResult)
  })

  it("shows loading state initially", () => {
    vi.mocked(api.course.getAll.useQuery).mockReturnValue({
      ...mockQueryResult,
      isLoading: true,
    })

    render(<CourseList />, { wrapper: Wrapper })
    
    expect(screen.getByText("Your Courses")).toBeInTheDocument()
    expect(screen.getAllByRole("row")).toHaveLength(4) // Header + 3 skeleton rows
  })

  it("shows empty state when no courses exist", () => {
    vi.mocked(api.course.getAll.useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any)

    render(<CourseList />, { wrapper: Wrapper })
    
    expect(screen.getByText("Your Courses")).toBeInTheDocument()
    expect(screen.getByText("No courses yet")).toBeInTheDocument()
    expect(screen.getByText("Get started by creating your first course")).toBeInTheDocument()
  })

  it("renders course list when courses exist", () => {
    vi.mocked(api.course.getAll.useQuery).mockReturnValue({
      data: mockCourseData,
      isLoading: false,
      error: null,
    } as CourseQueryResult)

    render(<CourseList />, { wrapper: Wrapper })
    
    expect(screen.getByText("Your Courses")).toBeInTheDocument()
    expect(screen.getByText("Test Course 1")).toBeInTheDocument()
  })
}) 
