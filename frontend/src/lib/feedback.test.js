import { describe, expect, it } from 'vitest';
import { FEEDBACK_TOPICS, MESSAGE_MAX, MESSAGE_MIN, validateFeedback } from './feedback.js';

const valid = { rating: '4', topic: 'Pricing', message: '  The SLA countdowns are great.  ', email: ' sam@example.com ' };

describe('validateFeedback', () => {
  it('accepts a complete entry and returns trimmed values with rating as a number', () => {
    expect(validateFeedback(valid)).toEqual({
      errors: {},
      value: { rating: 4, topic: 'Pricing', message: 'The SLA countdowns are great.', email: 'sam@example.com' },
    });
  });

  it('treats a blank email as null', () => {
    expect(validateFeedback({ ...valid, email: '   ' }).value.email).toBeNull();
    expect(validateFeedback({ ...valid, email: null }).value.email).toBeNull();
  });

  it.each(['', 0, 6, 2.5, 'abc'])('requires a rating between 1 and 5 (%j)', (rating) => {
    expect(validateFeedback({ ...valid, rating }).errors.rating).toBe('Choose a rating from 1 to 5');
  });

  it('rejects a topic outside FEEDBACK_TOPICS', () => {
    expect(FEEDBACK_TOPICS).not.toContain('Other');
    expect(validateFeedback({ ...valid, topic: 'Other' }).errors.topic).toBe('Choose a topic');
    expect(validateFeedback({ ...valid, topic: '' }).errors.topic).toBe('Choose a topic');
  });

  it('rejects a message shorter than 10 characters after trimming', () => {
    expect(validateFeedback({ ...valid, message: '   short  ' }).errors.message).toBe(
      'Tell us a little more (at least 10 characters)',
    );
  });

  it('rejects a message longer than 2000 characters', () => {
    expect(validateFeedback({ ...valid, message: 'a'.repeat(MESSAGE_MAX + 1) }).errors.message).toBe(
      'Keep it under 2000 characters',
    );
  });

  it('accepts exactly 10 and exactly 2000 characters', () => {
    expect(validateFeedback({ ...valid, message: 'a'.repeat(MESSAGE_MIN) }).errors).toEqual({});
    expect(validateFeedback({ ...valid, message: 'a'.repeat(MESSAGE_MAX) }).errors).toEqual({});
  });

  it('rejects malformed emails and emails over 254 characters', () => {
    for (const email of ['sam', 'sam@', 'sam@example', 'sam @example.com', 'a@b@c.com']) {
      expect(validateFeedback({ ...valid, email }).errors.email).toBe('Enter a valid email, or leave it blank');
    }
    const long = `${'a'.repeat(243)}@example.com`;
    expect(long.length).toBe(255);
    expect(validateFeedback({ ...valid, email: long }).errors.email).toBeDefined();
  });

  it('returns null value whenever there are errors', () => {
    const result = validateFeedback({ rating: '', topic: '', message: '', email: 'x' });
    expect(Object.keys(result.errors)).toEqual(['rating', 'topic', 'message', 'email']);
    expect(result.value).toBeNull();
  });

  it.each([
    [null, 'null'],
    ['text', 'string'],
    [[], 'an array'],
  ])('throws a TypeError naming the bad input when input is %j', (input, got) => {
    expect(() => validateFeedback(input)).toThrow(TypeError);
    expect(() => validateFeedback(input)).toThrow(`input must be an object, got ${got}`);
  });
});
