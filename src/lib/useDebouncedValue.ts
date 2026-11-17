import { useEffect, useState } from 'react';

/**
 * Delays a value — the search field feeds raw keystrokes in, the query runs on
 * the settled value (design contract: 250 ms debounce across name + phone).
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
