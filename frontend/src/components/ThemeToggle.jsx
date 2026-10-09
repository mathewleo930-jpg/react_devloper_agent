import { isTheme } from '../theme.js';

export default function ThemeToggle({ theme, onToggle }) {
  if (!isTheme(theme)) {
    throw new TypeError(`Invalid theme: "${theme}"; expected "light" or "dark"`);
  }
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      className="theme-switch"
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={onToggle}
    >
      <span className="theme-switch-label">Dark mode</span>
      <span className="theme-switch-track" aria-hidden="true">
        <span className="theme-switch-thumb">{isDark ? '☾' : '☀'}</span>
      </span>
    </button>
  );
}
