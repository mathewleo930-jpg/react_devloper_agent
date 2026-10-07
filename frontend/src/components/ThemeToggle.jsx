import { isTheme } from '../theme.js';

export default function ThemeToggle({ theme, onToggle }) {
  if (!isTheme(theme)) {
    throw new TypeError(`Invalid theme: "${theme}"; expected "light" or "dark"`);
  }
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="btn theme-toggle"
      aria-pressed={isDark}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={onToggle}
    >
      <span aria-hidden="true">{isDark ? '☾' : '☀'}</span>
      Dark mode
    </button>
  );
}
