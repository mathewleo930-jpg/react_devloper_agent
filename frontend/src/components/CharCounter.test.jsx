import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import CharCounter from './CharCounter.jsx';

function renderCounter(length, max = 200) {
  const { container } = render(<CharCounter id="title-count" length={length} max={max} />);
  return container.querySelector('#title-count');
}

describe('CharCounter', () => {
  afterEach(cleanup);

  it('renders "length / max" with the given id', () => {
    const counter = renderCounter(42);
    expect(counter.textContent).toBe('42 / 200');
    expect(counter.classList.contains('char-count')).toBe(true);
  });

  it('has no near class or "left" text below 90%', () => {
    const counter = renderCounter(179);
    expect(counter.classList.contains('char-count-near')).toBe(false);
    expect(counter.textContent).not.toMatch(/left/);
  });

  it('adds char-count-near and "N left" text at 90% or more', () => {
    const counter = renderCounter(185);
    expect(counter.classList.contains('char-count-near')).toBe(true);
    expect(counter.textContent).toBe('185 / 200 · 15 left');
  });

  it('shows "0 left" at the limit', () => {
    expect(renderCounter(2000, 2000).textContent).toBe('2000 / 2000 · 0 left');
  });
});
