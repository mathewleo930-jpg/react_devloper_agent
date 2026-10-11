import { isNearLimit } from '../charLimit.js';

// Not a live region on purpose: announcing every keystroke would be noisy.
// Fields reference it with aria-describedby so it is read on focus instead.
export default function CharCounter({ id, length, max }) {
  const near = isNearLimit(length, max);
  return (
    <p id={id} className={near ? 'char-count char-count-near' : 'char-count'}>
      {length} / {max}
      {near && ` · ${max - length} left`}
    </p>
  );
}
