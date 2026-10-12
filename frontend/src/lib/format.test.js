import { describe, expect, it } from 'vitest';
import { formatDuration, initials, slaInfo, timeAgo } from './format.js';

const HOUR = 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 12, 12);

describe('format helpers', () => {
  it('timeAgo buckets into minutes, hours and days', () => {
    expect(timeAgo(NOW - 10 * 1000, NOW)).toBe('just now');
    expect(timeAgo(NOW - 5 * 60 * 1000, NOW)).toBe('5m ago');
    expect(timeAgo(NOW - 3 * HOUR, NOW)).toBe('3h ago');
    expect(timeAgo(NOW - 50 * HOUR, NOW)).toBe('2d ago');
  });

  it('formatDuration picks a readable unit', () => {
    expect(formatDuration(null)).toBe('-');
    expect(formatDuration(20 * 60 * 1000)).toBe('20m');
    expect(formatDuration(1.5 * HOUR)).toBe('1.5h');
    expect(formatDuration(48 * HOUR)).toBe('2d');
  });

  it('initials uses up to two words', () => {
    expect(initials('Priya Nair')).toBe('PN');
    expect(initials('Ana Maria Lopez')).toBe('AM');
    expect(initials('')).toBe('');
  });

  it('slaInfo reports ok, warning, breached and met', () => {
    const t = (priority, hoursAgo, status = 'open') => ({ priority, status, createdAt: NOW - hoursAgo * HOUR });
    expect(slaInfo(t('low', 1), NOW).state).toBe('ok');
    expect(slaInfo(t('urgent', 3.5), NOW).state).toBe('warning');
    expect(slaInfo(t('urgent', 6), NOW)).toEqual({ state: 'breached', label: 'Overdue 2h' });
    expect(slaInfo(t('urgent', 6, 'resolved'), NOW).state).toBe('met');
  });
});
