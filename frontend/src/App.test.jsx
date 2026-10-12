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

  it('landing shows the Diwali banner and the Business plan at $26.10, down from $29', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 2, name: 'Happy Diwali from Deskline' })).toBeTruthy();
    const business = screen.getByRole('heading', { level: 3, name: 'Business' }).closest('article');
    expect(within(business).getByText('$29', { selector: 's' }).textContent).toBe('Was $29');
    expect(within(business).getByText(/\$26\.10/).textContent).toBe('Now $26.10');
    expect(within(business).getByText(/Diwali offer · 10% off/)).toBeTruthy();
    const starter = screen.getByRole('heading', { level: 3, name: 'Starter' }).closest('article');
    expect(within(starter).getByText('$0')).toBeTruthy();
    expect(within(starter).queryByText(/Diwali offer/)).toBeNull();
  });

  it('See Diwali prices moves focus to the pricing heading', () => {
    Element.prototype.scrollIntoView = vi.fn();
    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: 'See Diwali prices' }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(document.activeElement.textContent).toBe('Simple plans that scale with you');
    delete Element.prototype.scrollIntoView;
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
