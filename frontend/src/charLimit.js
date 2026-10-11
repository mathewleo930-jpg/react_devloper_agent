// Match the database limits on tasks.title (1-200) and tasks.description (≤2000).
export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 2000;
export const WARN_RATIO = 0.9;

export function isNearLimit(length, max) {
  if (!Number.isInteger(length) || length < 0) {
    throw new TypeError(`isNearLimit: length must be a non-negative integer, got ${length}`);
  }
  if (!Number.isInteger(max) || max <= 0) {
    throw new TypeError(`isNearLimit: max must be a positive integer, got ${max}`);
  }
  return length / max >= WARN_RATIO;
}
