import { initials } from '../lib/format.js';

// A stable tint per person, picked from a small set of muted hues.
const TINTS = 6;
function tintFor(seed = '') {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % TINTS;
}

export default function Avatar({ name, size = 'md', presence }) {
  return (
    <span className={`avatar avatar-${size} avatar-tint-${tintFor(name)}`} title={name}>
      <span aria-hidden="true">{initials(name)}</span>
      {presence && <span className={`presence presence-${presence}`} aria-label={presence} />}
    </span>
  );
}
