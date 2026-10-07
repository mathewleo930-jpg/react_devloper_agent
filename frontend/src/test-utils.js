export function createFakeStorage(initial = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    clear: () => items.clear(),
  };
}

export function createMatchMedia(prefersDark) {
  return (query) => ({
    matches: prefersDark && query === '(prefers-color-scheme: dark)',
    media: query,
  });
}
