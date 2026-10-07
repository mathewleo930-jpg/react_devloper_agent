import { useCallback, useEffect, useState } from 'react';
import { applyTheme, getInitialTheme, persistTheme } from '../theme.js';

export default function useTheme() {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
