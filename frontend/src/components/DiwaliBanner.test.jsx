import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DIWALI_PROMO } from '../data/promotion.js';
import DiwaliBanner from './DiwaliBanner.jsx';

describe('DiwaliBanner', () => {
  afterEach(cleanup);

  it('renders the Diwali heading, message and the percent-off pill', () => {
    render(<DiwaliBanner promo={DIWALI_PROMO} onShowPricing={() => {}} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Happy Diwali from Deskline' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Happy Diwali from Deskline' })).toBeTruthy();
    expect(screen.getByText(DIWALI_PROMO.message)).toBeTruthy();
    expect(screen.getByText(/10% off paid plans/)).toBeTruthy();
  });

  it('See Diwali prices button calls onShowPricing', () => {
    const onShowPricing = vi.fn();
    render(<DiwaliBanner promo={DIWALI_PROMO} onShowPricing={onShowPricing} />);
    const button = screen.getByRole('button', { name: 'See Diwali prices' });
    expect(button.getAttribute('type')).toBe('button');
    fireEvent.click(button);
    expect(onShowPricing).toHaveBeenCalledTimes(1);
  });

  it('decorative image has empty alt', () => {
    const { container } = render(<DiwaliBanner promo={DIWALI_PROMO} onShowPricing={() => {}} />);
    const img = container.querySelector('img.promo-photo');
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('src')).toMatch(/assets\/images\/diwali-diyas\.jpg$/);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('throws for an invalid percentOff', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const percentOff of [0, 101, Number.NaN, '10', undefined]) {
      expect(() => render(<DiwaliBanner promo={{ ...DIWALI_PROMO, percentOff }} onShowPricing={() => {}} />))
        .toThrow(/percentOff/);
    }
    consoleError.mockRestore();
  });
});
