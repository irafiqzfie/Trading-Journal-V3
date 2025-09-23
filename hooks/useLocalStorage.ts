import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Prevent server-side execution of localStorage
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    // This effect will only run on the client side, where window is available.
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // A more advanced implementation might handle errors here, e.g., if storage is full.
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
