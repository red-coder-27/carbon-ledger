import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value by a specified delay.
 * @template T - The type of the value to debounce
 * @param {T} value - The value to be debounced
 * @param {number} delay - The debounce delay in milliseconds
 * @returns {T} The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
