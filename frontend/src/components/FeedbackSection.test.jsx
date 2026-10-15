import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FeedbackSection from './FeedbackSection.jsx';

const fill = ({ rating = '4 · Good', topic = 'Feature request', message = 'Please add a calendar view.', email = '' } = {}) => {
  fireEvent.click(screen.getByRole('radio', { name: rating }));
  fireEvent.change(screen.getByLabelText(/^Topic/), { target: { value: topic } });
  fireEvent.change(screen.getByLabelText(/^Your feedback/), { target: { value: message } });
  fireEvent.change(screen.getByLabelText('Email (optional)'), { target: { value: email } });
};

const send = () => fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('FeedbackSection', () => {
  afterEach(cleanup);

  it('renders the heading, rating options with words, topic, message and optional email', () => {
    render(<FeedbackSection submit={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Tell us what you think' })).toBeTruthy();
    expect(screen.getByRole('group', { name: /How would you rate Deskline\?/ })).toBeTruthy();
    expect(screen.getAllByRole('radio').map((r) => r.labels[0].textContent)).toEqual([
      '1 · Very poor',
      '2 · Poor',
      '3 · Okay',
      '4 · Good',
      '5 · Excellent',
    ]);
    const topics = screen.getByLabelText(/^Topic/).querySelectorAll('option');
    expect([...topics].map((o) => o.textContent)).toEqual([
      'Choose a topic…',
      'General',
      'Feature request',
      'Bug report',
      'Pricing',
      'Ease of use',
    ]);
    expect(screen.getByLabelText(/^Your feedback/).getAttribute('maxlength')).toBe('2000');
    expect(screen.getByLabelText('Email (optional)').getAttribute('aria-describedby')).toBe('fb-email-hint');
  });

  it('shows field errors and focuses the first invalid field when submitted empty', () => {
    const submit = vi.fn();
    render(<FeedbackSection submit={submit} />);
    send();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByText('Choose a rating from 1 to 5')).toBeTruthy();
    expect(screen.getByText('Choose a topic')).toBeTruthy();
    expect(screen.getByText('Tell us a little more (at least 10 characters)')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '1 · Very poor' }));
    const topic = screen.getByLabelText(/^Topic/);
    expect(topic.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(topic.getAttribute('aria-describedby')).textContent).toBe('Choose a topic');
  });

  it('focuses the email field when it is the only invalid one', () => {
    render(<FeedbackSection submit={vi.fn()} />);
    fill({ email: 'not-an-email' });
    send();
    expect(screen.getByText('Enter a valid email, or leave it blank')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Email (optional)'));
  });

  it('submits the validated value and shows the thank-you message with focus on it', async () => {
    const submit = vi.fn().mockResolvedValue();
    render(<FeedbackSection submit={submit} />);
    fill({ message: '  Please add a calendar view.  ', email: 'sam@example.com' });
    await act(async () => send());
    expect(submit).toHaveBeenCalledWith({
      rating: 4,
      topic: 'Feature request',
      message: 'Please add a calendar view.',
      email: 'sam@example.com',
    });
    const heading = screen.getByRole('heading', { name: 'Thanks for your feedback!' });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByRole('status').textContent).toMatch(/we’ll reply to sam@example\.com if we have questions/);
  });

  it('shows Sending… and disables the button while the request is pending', async () => {
    const pending = deferred();
    render(<FeedbackSection submit={() => pending.promise} />);
    fill();
    send();
    const button = screen.getByRole('button', { name: 'Sending…' });
    expect(button.disabled).toBe(true);
    expect(button.closest('form').getAttribute('aria-busy')).toBe('true');
    await act(async () => pending.resolve());
    expect(screen.getByRole('heading', { name: 'Thanks for your feedback!' })).toBeTruthy();
  });

  it('shows a friendly error and keeps the typed values when submit rejects', async () => {
    const submit = vi.fn().mockRejectedValue(new Error('JWT expired at 12:00'));
    render(<FeedbackSection submit={submit} />);
    fill({ email: 'sam@example.com' });
    await act(async () => send());
    expect(screen.getByRole('alert').textContent).toBe(
      'We couldn’t send your feedback. Check your connection and try again.',
    );
    expect(screen.queryByText(/JWT expired/)).toBeNull();
    expect(screen.getByRole('radio', { name: '4 · Good' }).checked).toBe(true);
    expect(screen.getByLabelText(/^Topic/).value).toBe('Feature request');
    expect(screen.getByLabelText(/^Your feedback/).value).toBe('Please add a calendar view.');
    expect(screen.getByLabelText('Email (optional)').value).toBe('sam@example.com');
    expect(screen.getByRole('button', { name: 'Send feedback' }).disabled).toBe(false);
  });

  it('Send more feedback returns to an empty form', async () => {
    render(<FeedbackSection submit={vi.fn().mockResolvedValue()} />);
    fill();
    await act(async () => send());
    expect(screen.getByRole('status').textContent).not.toMatch(/reply to/);
    fireEvent.click(screen.getByRole('button', { name: 'Send more feedback' }));
    expect(screen.getAllByRole('radio').some((r) => r.checked)).toBe(false);
    expect(screen.getByLabelText(/^Topic/).value).toBe('');
    expect(screen.getByLabelText(/^Your feedback/).value).toBe('');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '1 · Very poor' }));
  });

  it('does not call submit when the honeypot is filled but still shows thanks', () => {
    const submit = vi.fn();
    const { container } = render(<FeedbackSection submit={submit} />);
    fireEvent.change(container.querySelector('input[name="website"]'), { target: { value: 'http://spam.example' } });
    send();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Thanks for your feedback!' })).toBeTruthy();
  });
});
