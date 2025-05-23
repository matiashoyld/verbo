import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '~/app/recruiter/candidates/components/SearchBar';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

describe('End-to-End Integration Tests', () => {
  describe('SearchBar Integration', () => {
    const mockProps = {
      onSearch: jest.fn(),
      onFilter: jest.fn(),
      roles: ['Frontend Developer', 'Backend Developer'],
      locations: ['Remote', 'New York'],
      skills: ['JavaScript', 'React', 'Node.js'],
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('complete search and filter workflow', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...mockProps} />);

      // Step 1: Search for candidates
      const searchInput = screen.getByPlaceholderText('Search candidates by name, skill or role...');
      await user.type(searchInput, 'John Doe');
      expect(mockProps.onSearch).toHaveBeenLastCalledWith('John Doe');

      // Step 2: Open filter menu
      const filterButton = screen.getByRole('button');
      await user.click(filterButton);

      // Step 3: Select filters
      await waitFor(() => {
        expect(screen.getByText('Filter Candidates')).toBeInTheDocument();
      });

      // Select role
      await user.click(screen.getByText('Frontend Developer'));
      expect(mockProps.onFilter).toHaveBeenCalledWith({
        role: 'Frontend Developer',
      });

      // Select location
      await user.click(screen.getByText('Remote'));
      expect(mockProps.onFilter).toHaveBeenCalledWith({
        role: 'Frontend Developer',
        location: 'Remote',
      });

      // Select skills
      await user.click(screen.getByText('JavaScript'));
      expect(mockProps.onFilter).toHaveBeenCalledWith({
        role: 'Frontend Developer',
        location: 'Remote',
        skillNames: ['JavaScript'],
      });

      await user.click(screen.getByText('React'));
      expect(mockProps.onFilter).toHaveBeenCalledWith({
        role: 'Frontend Developer',
        location: 'Remote',
        skillNames: ['JavaScript', 'React'],
      });

      // Step 4: Apply filters
      await user.click(screen.getByText('Apply Filters'));

      // Filter should close
      await waitFor(() => {
        expect(screen.queryByText('Filter Candidates')).not.toBeInTheDocument();
      });
    });

    test('filter reset workflow', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...mockProps} />);

      // Open filters and select some options
      const filterButton = screen.getByRole('button');
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Frontend Developer'));
      await user.click(screen.getByText('JavaScript'));

      // Clear all filters
      await waitFor(() => {
        expect(screen.getByText('Clear filters')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Clear filters'));
      expect(mockProps.onFilter).toHaveBeenCalledWith({});
    });

    test('accessibility and keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...mockProps} />);

      // Test keyboard navigation
      const searchInput = screen.getByPlaceholderText('Search candidates by name, skill or role...');
      
      // Focus should start on search input when tabbed
      await user.tab();
      expect(searchInput).toHaveFocus();

      // Tab to filter button
      await user.tab();
      const filterButton = screen.getByRole('button');
      expect(filterButton).toHaveFocus();

      // Enter should open the filter
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Filter Candidates')).toBeInTheDocument();
      });
    });
  });

  describe('Button Component Integration', () => {
    test('button variants work with custom styling', () => {
      const customClass = 'custom-test-class';
      
      render(
        <Button variant="destructive" className={cn('base-class', customClass)}>
          Test Button
        </Button>
      );

      const button = screen.getByRole('button', { name: 'Test Button' });
      expect(button).toHaveClass('bg-destructive');
      expect(button).toHaveClass('base-class');
      expect(button).toHaveClass('custom-test-class');
    });

    test('button as link works correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <Button asChild>
          <a href="/test-link" data-testid="link-button">
            Link Button
          </a>
        </Button>
      );

      const linkButton = screen.getByTestId('link-button');
      expect(linkButton.tagName).toBe('A');
      expect(linkButton).toHaveAttribute('href', '/test-link');
      
      // Should have button styles but be an anchor element
      expect(linkButton).toHaveClass('inline-flex');
      expect(linkButton).toHaveClass('items-center');
    });

    test('disabled button prevents interaction', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(
        <Button disabled onClick={onClick}>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole('button', { name: 'Disabled Button' });
      
      await user.click(button);
      
      expect(onClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });
  });

  describe('Utils Integration', () => {
    test('cn function works with real component props', () => {
      const baseClasses = 'inline-flex items-center justify-center';
      const conditionalClass = 'bg-primary';
      const customClass = 'custom-spacing';
      
      const result = cn(
        baseClasses,
        true && conditionalClass,
        customClass,
        false && 'not-applied'
      );

      expect(result).toBe('inline-flex items-center justify-center bg-primary custom-spacing');
    });

    test('cn handles complex component styling patterns', () => {
      const isActive = true;
      const size = 'lg';
      const variant = 'outline';

      const result = cn(
        'base-class',
        {
          'active-class': isActive,
          'inactive-class': !isActive,
        },
        size === 'lg' && 'large-size',
        variant === 'outline' && 'outline-variant'
      );

      expect(result).toBe('base-class active-class large-size outline-variant');
    });
  });

  describe('Form Integration', () => {
    test('form submission with validation', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      const TestForm = () => {
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          onSubmit({
            name: formData.get('name'),
            email: formData.get('email'),
          });
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Enter name"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              required
            />
            <Button type="submit">Submit</Button>
          </form>
        );
      };

      render(<TestForm />);

      // Fill out form
      await user.type(screen.getByPlaceholderText('Enter name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Enter email'), 'john@example.com');

      // Submit form
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    test('form validation prevents submission with invalid data', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      const TestForm = () => {
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          if (form.checkValidity()) {
            onSubmit('form submitted');
          }
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              required
            />
            <Button type="submit">Submit</Button>
          </form>
        );
      };

      render(<TestForm />);

      // Try to submit without filling required field
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      // Form should not submit
      expect(onSubmit).not.toHaveBeenCalled();

      // Fill with invalid email
      await user.type(screen.getByPlaceholderText('Enter email'), 'invalid-email');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      // Should still not submit due to invalid email
      expect(onSubmit).not.toHaveBeenCalled();

      // Fill with valid email
      await user.clear(screen.getByPlaceholderText('Enter email'));
      await user.type(screen.getByPlaceholderText('Enter email'), 'valid@example.com');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      // Now it should submit
      expect(onSubmit).toHaveBeenCalledWith('form submitted');
    });
  });
});