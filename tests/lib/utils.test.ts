import { cn } from '~/lib/utils';

describe('cn utility function', () => {
  test('merges classes correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  test('handles conditional classes', () => {
    expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class');
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class');
  });

  test('merges tailwind classes correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  test('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn(null, undefined)).toBe('');
  });

  test('handles array inputs', () => {
    expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500');
  });

  test('handles object inputs', () => {
    expect(cn({
      'text-red-500': true,
      'bg-blue-500': false,
      'border-2': true,
    })).toBe('text-red-500 border-2');
  });
});