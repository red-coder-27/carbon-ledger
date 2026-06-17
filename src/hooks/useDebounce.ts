import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any input value change by a specified delay in milliseconds.
 * 
 * This hook sets up a timer that updates the debounced value state after the delay
 * elapsed. If the input value changes before the timer finishes, the previous timer
 * is cleared, effectively throttling rapid consecutive value updates (such as text keystrokes).
 * 
 * @template T - The generic type of the value to debounce
 * @param {T} value - The raw input state value to be debounced
 * @param {number} delay - The debounce delay in milliseconds (e.g. 500ms)
 * @returns {T} The debounced value, which is updated only after the specified delay has passed
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect((): (() => void) => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return (): void => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
