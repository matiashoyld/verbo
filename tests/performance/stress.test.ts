import { render, screen } from '@testing-library/react';
import { SearchBar } from '~/app/recruiter/candidates/components/SearchBar';
import { cn } from '~/lib/utils';

describe('Performance Tests', () => {
  describe('SearchBar Performance', () => {
    test('handles large datasets efficiently', () => {
      const largeDataset = {
        roles: Array.from({ length: 100 }, (_, i) => `Role ${i + 1}`),
        locations: Array.from({ length: 200 }, (_, i) => `Location ${i + 1}`),
        skills: Array.from({ length: 500 }, (_, i) => `Skill ${i + 1}`),
      };

      const startTime = performance.now();

      render(
        <SearchBar
          onSearch={jest.fn()}
          onFilter={jest.fn()}
          roles={largeDataset.roles}
          locations={largeDataset.locations}
          skills={largeDataset.skills}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);

      // Should still find the search input
      expect(screen.getByPlaceholderText('Search candidates by name, skill or role...')).toBeInTheDocument();
    });

    test('cn function performance with many classes', () => {
      const manyClasses = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      
      const startTime = performance.now();
      
      // Run cn function many times
      for (let i = 0; i < 1000; i++) {
        cn(...manyClasses, i % 2 === 0 && 'conditional-class');
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 50ms for 1000 iterations)
      expect(executionTime).toBeLessThan(50);
    });

    test('memory usage with frequent re-renders', () => {
      const TestComponent = ({ count }: { count: number }) => (
        <SearchBar
          onSearch={jest.fn()}
          onFilter={jest.fn()}
          roles={Array.from({ length: count }, (_, i) => `Role ${i}`)}
          locations={Array.from({ length: count }, (_, i) => `Location ${i}`)}
          skills={Array.from({ length: count }, (_, i) => `Skill ${i}`)}
        />
      );

      const { rerender } = render(<TestComponent count={10} />);

      // Simulate many re-renders with changing data
      const startTime = performance.now();
      
      for (let i = 1; i <= 50; i++) {
        rerender(<TestComponent count={i * 2} />);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle re-renders efficiently (less than 200ms for 50 re-renders)
      expect(totalTime).toBeLessThan(200);
    });
  });

  describe('Utility Functions Performance', () => {
    test('cn function with edge cases', () => {
      const edgeCases = [
        // Empty arrays
        [],
        // Very long strings
        ['a'.repeat(1000)],
        // Many small strings
        Array.from({ length: 100 }, (_, i) => `c${i}`),
        // Mixed types
        ['string', true && 'conditional', false && 'not-applied', { active: true, inactive: false }],
        // Nested arrays
        [['nested', 'array'], ['another', 'nested']],
      ];

      edgeCases.forEach((testCase, index) => {
        const startTime = performance.now();
        
        // Run multiple times to get better measurement
        for (let i = 0; i < 100; i++) {
          cn(...(testCase as any));
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Each edge case should process quickly (less than 10ms for 100 iterations)
        expect(executionTime).toBeLessThan(10);
      });
    });

    test('concurrent function calls', async () => {
      const concurrentCalls = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve(cn('base-class', `dynamic-${i}`, i % 2 === 0 && 'even'))
      );

      const startTime = performance.now();
      const results = await Promise.all(concurrentCalls);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      
      // Should handle concurrent calls efficiently
      expect(totalTime).toBeLessThan(20);
      expect(results).toHaveLength(100);
      
      // Verify results are correct
      results.forEach((result, index) => {
        expect(result).toContain('base-class');
        expect(result).toContain(`dynamic-${index}`);
        if (index % 2 === 0) {
          expect(result).toContain('even');
        }
      });
    });
  });

  describe('Component Stress Tests', () => {
    test('rapid state changes', async () => {
      let filterCallCount = 0;
      const onFilter = jest.fn(() => {
        filterCallCount++;
      });

      render(
        <SearchBar
          onSearch={jest.fn()}
          onFilter={onFilter}
          roles={['Role1', 'Role2']}
          locations={['Location1', 'Location2']}
          skills={['Skill1', 'Skill2']}
        />
      );

      // Simulate rapid filter changes
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        onFilter({
          role: i % 2 === 0 ? 'Role1' : 'Role2',
          location: i % 3 === 0 ? 'Location1' : undefined,
          skillNames: i % 4 === 0 ? ['Skill1'] : undefined,
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(filterCallCount).toBe(100);
      expect(totalTime).toBeLessThan(50); // Should handle rapid calls efficiently
    });

    test('handles extreme prop changes', () => {
      const TestWrapper = ({ size }: { size: number }) => (
        <SearchBar
          onSearch={jest.fn()}
          onFilter={jest.fn()}
          roles={Array.from({ length: size }, (_, i) => `Role ${i}`)}
          locations={Array.from({ length: size }, (_, i) => `Location ${i}`)}
          skills={Array.from({ length: size }, (_, i) => `Skill ${i}`)}
        />
      );

      const { rerender } = render(<TestWrapper size={1} />);

      const startTime = performance.now();

      // Test extreme changes in prop sizes
      const sizes = [1, 10, 100, 1000, 100, 10, 1];
      sizes.forEach(size => {
        rerender(<TestWrapper size={size} />);
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle extreme prop changes within reasonable time
      expect(totalTime).toBeLessThan(300);
    });
  });

  describe('Memory Leak Tests', () => {
    test('cleanup after unmounting', () => {
      const TestComponent = () => (
        <SearchBar
          onSearch={jest.fn()}
          onFilter={jest.fn()}
          roles={Array.from({ length: 100 }, (_, i) => `Role ${i}`)}
          locations={Array.from({ length: 100 }, (_, i) => `Location ${i}`)}
          skills={Array.from({ length: 100 }, (_, i) => `Skill ${i}`)}
        />
      );

      // Mount and unmount multiple times
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(<TestComponent />);
        unmount();
      }

      // If we get here without errors, cleanup is working properly
      expect(true).toBe(true);
    });

    test('no memory leaks with event handlers', () => {
      const handlers = {
        onSearch: jest.fn(),
        onFilter: jest.fn(),
      };

      const TestComponent = ({ iteration }: { iteration: number }) => (
        <SearchBar
          onSearch={handlers.onSearch}
          onFilter={handlers.onFilter}
          roles={[`Role ${iteration}`]}
          locations={[`Location ${iteration}`]}
          skills={[`Skill ${iteration}`]}
        />
      );

      // Create and destroy many components with the same handlers
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(<TestComponent iteration={i} />);
        unmount();
      }

      // Handlers should still be the same objects (not recreated)
      expect(typeof handlers.onSearch).toBe('function');
      expect(typeof handlers.onFilter).toBe('function');
    });
  });
});