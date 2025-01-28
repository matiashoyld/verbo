import { render, screen } from "@testing-library/react"
import { CourseList } from "../CourseList"
import { api } from "~/trpc/react"
import { expect, vi, describe, it } from "vitest"

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

describe("CourseList", () => {
  it("shows loading state initially", () => {
    vi.mocked(api.course.getAll.useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isFetching: true,
      refetch: vi.fn(),
    } as any)

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
    const mockCourses = [
      {
        id: "1",
        name: "Introduction to Literature",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user1",
      },
      {
        id: "2",
        name: "Advanced Poetry",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user1",
      },
    ]

    vi.mocked(api.course.getAll.useQuery).mockReturnValue({
      data: mockCourses,
      isLoading: false,
      error: null,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any)

    render(<CourseList />, { wrapper: Wrapper })
    
    expect(screen.getByText("Your Courses")).toBeInTheDocument()
    expect(screen.getByText("Introduction to Literature")).toBeInTheDocument()
    expect(screen.getByText("Advanced Poetry")).toBeInTheDocument()
  })
}) 
