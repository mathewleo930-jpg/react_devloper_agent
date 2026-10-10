import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { toBreakdown } from '../breakdown.js';
import BreakdownChart from './BreakdownChart.jsx';

function renderChart(stats) {
  render(<BreakdownChart items={toBreakdown(stats)} />);
}

describe('BreakdownChart', () => {
  afterEach(cleanup);

  it('renders one bar per state with label, count and percent', () => {
    renderChart({ completed: 3, pending: 5, deleted: 2 });
    const bars = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(bars.map((bar) => bar.textContent)).toEqual([
      'Completed: 3 tasks, 30%3 · 30%Completed',
      'Pending: 5 tasks, 50%5 · 50%Pending',
      'Deleted: 2 tasks, 20%2 · 20%Deleted',
    ]);
    expect(screen.getByText('Deleted: 2 tasks, 20%')).toBeTruthy();
  });

  it('scales bar size relative to the largest count', () => {
    renderChart({ completed: 2, pending: 4, deleted: 0 });
    const size = (key) => screen.getByTestId(`bar-${key}`).style.getPropertyValue('--bar-size');
    expect(size('pending')).toBe('1');
    expect(size('completed')).toBe('0.5');
    expect(size('deleted')).toBe('0');
  });

  it('figcaption summarises the breakdown in words', () => {
    renderChart({ completed: 3, pending: 5, deleted: 2 });
    const caption = screen.getByText(/^Out of/);
    expect(caption.tagName).toBe('FIGCAPTION');
    expect(caption.getAttribute('aria-live')).toBe('polite');
    expect(caption.textContent).toBe(
      'Out of 10 tasks, 3 are completed (30%), 5 are pending (50%) and 2 were deleted (20%).',
    );
  });
});
