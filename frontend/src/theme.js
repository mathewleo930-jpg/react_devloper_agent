export const THEMES = ['light', 'dark'];
export const THEME_STORAGE_KEY = 'theme';

export function isTheme(value) {
  return THEMES.includes(value);
}

function assertTheme(theme) {
  if (!isTheme(theme)) {
    throw new TypeError(`Invalid theme: "${theme}"; expected "light" or "dark"`);
  }
}

function readStoredTheme(storage) {
  try {
    return storage?.getItem(THEME_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function prefersDark(matchMedia) {
  if (typeof matchMedia !== 'function') return false;
  try {
    return matchMedia('(prefers-color-scheme: dark)').matches === true;
  } catch {
    return false;
  }
}

export function getInitialTheme(storage = window.localStorage, matchMedia = window.matchMedia) {
  const stored = readStoredTheme(storage);
  if (isTheme(stored)) return stored;
  return prefersDark(matchMedia) ? 'dark' : 'light';
}

export function applyTheme(theme, root = document.documentElement) {
  assertTheme(theme);
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function persistTheme(theme, storage = window.localStorage) {
  assertTheme(theme);
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Saving is best-effort: private mode or a full quota must not stop the
    // theme from switching for the current session.
  }
}
