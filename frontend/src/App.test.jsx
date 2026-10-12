import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import { createSeedState } from './data/mockData.js';

vi.mock('./hooks/useTheme.js', () => ({
  default: () => ({ theme: 'light', toggleTheme: () => {} }),
}));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App initialState={createSeedState()} remote={false} />
    </MemoryRouter>,
  );
}

describe('App', () => {
  afterEach(cleanup);

  it('shows the landing page at /', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/resolved on time/);
    expect(screen.getAllByRole('link', { name: /Open app|Explore the live demo/ }).length).toBeGreaterThan(0);
  });

  it('app sidebar lists every workspace tab', () => {
    renderAt('/app');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const labels = within(nav).getAllByRole('link').map((l) => l.textContent.replace(/\d+$/, ''));
    expect(labels.slice(0, 6)).toEqual(['Overview', 'Tickets', 'Board', 'Customers', 'Team', 'Reports']);
    expect(within(nav).getByRole('link', { name: 'Overview' }).getAttribute('aria-current')).toBe('page');
  });

  it('ticket view tabs filter the list', () => {
    renderAt('/app/tickets');
    const rowsIn = () => screen.getAllByRole('row').length - 1;
    const open = rowsIn();
    fireEvent.click(screen.getByRole('tab', { name: /^Solved/ }));
    expect(screen.getByRole('tab', { name: /^Solved/ }).getAttribute('aria-selected')).toBe('true');
    expect(rowsIn()).not.toBe(open);
    expect(screen.getAllByText(/Resolved|Closed/, { selector: '.status-badge' }).length).toBe(rowsIn());
  });

  it('replying on a ticket adds the message to the thread', () => {
    renderAt('/app/tickets/TCK-1044');
    expect(screen.getByRole('heading', { name: 'Webhook deliveries failing with 401' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Reply to/), { target: { value: 'Rotating your signing secret now.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByText('Rotating your signing secret now.')).toBeTruthy();
  });

  it('shows not found for an unknown ticket', () => {
    renderAt('/app/tickets/TCK-9');
    expect(screen.getByRole('heading', { name: 'Ticket not found' })).toBeTruthy();
  });
});
