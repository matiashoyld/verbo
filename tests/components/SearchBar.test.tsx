import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '~/app/recruiter/candidates/components/SearchBar';

const mockProps = {
  onSearch: jest.fn(),
  onFilter: jest.fn(),
  roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer'],
  locations: ['Remote', 'New York', 'San Francisco'],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
};

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input', () => {
    render(<SearchBar {...mockProps} />);
    
    expect(screen.getByPlaceholderText('Search candidates by name, skill or role...')).toBeInTheDocument();
  });

  test('calls onSearch when typing in search input', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search candidates by name, skill or role...');
    await user.type(searchInput, 'John Doe');
    
    expect(mockProps.onSearch).toHaveBeenLastCalledWith('John Doe');
  });

  test('opens filter popover when filter button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Filter Candidates')).toBeInTheDocument();
    });
  });

  test('displays role filter options', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    await waitFor(() => {
      mockProps.roles.forEach(role => {
        expect(screen.getByText(role)).toBeInTheDocument();
      });
    });
  });

  test('selects and deselects role filter', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });
    
    // Select role
    await user.click(screen.getByText('Frontend Developer'));
    expect(mockProps.onFilter).toHaveBeenCalledWith({
      role: 'Frontend Developer',
    });
    
    // Deselect role
    await user.click(screen.getByText('Frontend Developer'));
    expect(mockProps.onFilter).toHaveBeenCalledWith({
      role: undefined,
    });
  });

  test('displays location filter options', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    await waitFor(() => {
      mockProps.locations.forEach(location => {
        expect(screen.getByText(location)).toBeInTheDocument();
      });
    });
  });

  test('selects location filter', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Remote')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Remote'));
    expect(mockProps.onFilter).toHaveBeenCalledWith({
      location: 'Remote',
    });
  });

  test('displays skills filter options', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    await waitFor(() => {
      mockProps.skills.forEach(skill => {
        expect(screen.getByText(skill)).toBeInTheDocument();
      });
    });
  });

  test('selects multiple skills', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });
    
    // Select first skill
    await user.click(screen.getByText('JavaScript'));
    expect(mockProps.onFilter).toHaveBeenCalledWith({
      skillNames: ['JavaScript'],
    });
    
    // Select second skill
    await user.click(screen.getByText('React'));
    expect(mockProps.onFilter).toHaveBeenCalledWith({
      skillNames: ['JavaScript', 'React'],
    });
  });

  test('shows active filter count', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    // Select a role
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Frontend Developer'));
    
    // Filter count should appear
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  test('clears all filters', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    // Select a role first
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Frontend Developer'));
    
    // Clear filters
    await waitFor(() => {
      expect(screen.getByText('Clear filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Clear filters'));
    
    expect(mockProps.onFilter).toHaveBeenCalledWith({});
  });

  test('handles empty props arrays gracefully', () => {
    render(
      <SearchBar
        onSearch={mockProps.onSearch}
        onFilter={mockProps.onFilter}
        roles={[]}
        locations={[]}
        skills={[]}
      />
    );
    
    expect(screen.getByPlaceholderText('Search candidates by name, skill or role...')).toBeInTheDocument();
  });

  test('applies filters and closes popover', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    await user.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Apply Filters'));
    
    // Popover should close
    await waitFor(() => {
      expect(screen.queryByText('Filter Candidates')).not.toBeInTheDocument();
    });
  });
});