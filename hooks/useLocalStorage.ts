import { useState, useEffect, type Dispatch, type SetStateAction, useRef } from 'react';

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(initialValue);
  const isMounted = useRef(false);

  // This effect runs only on the client, after hydration.
  // It reads the value from localStorage and updates the state.
  useEffect(() => {
    try {
        const stored = window.localStorage.getItem(key);
        setValue(stored ? JSON.parse(stored) : initialValue);
    } catch(error) {
        console.error(error)
        setValue(initialValue)
    }
  }, [key]);

  // This effect writes the value to localStorage, but skips the initial render.
  useEffect(() => {
    // We use a ref to prevent writing to localStorage on the first render,
    // which avoids overwriting an existing value with the `initialValue`.
    if (isMounted.current) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch(error) {
            console.error(error)
        }
    } else {
        isMounted.current = true;
    }
  }, [key, value]);

  return [value, setValue];
};