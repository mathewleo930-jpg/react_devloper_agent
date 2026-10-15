export const FEEDBACK_TOPICS = ['General', 'Feature request', 'Bug report', 'Pricing', 'Ease of use'];
export const RATING_LABELS = { 1: 'Very poor', 2: 'Poor', 3: 'Okay', 4: 'Good', 5: 'Excellent' };
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
export const EMAIL_MAX = 254;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const text = (value) => (typeof value === 'string' ? value.trim() : '');
// Counts code points, like Postgres char_length, so an emoji counts once.
const charLength = (value) => [...value].length;

function parseRating(rating) {
  if (typeof rating === 'string' && rating.trim() === '') return null;
  const n = Number(rating);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

// Returns friendly messages for user mistakes; throws only for programmer errors.
export function validateFeedback(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    const got = input === null ? 'null' : Array.isArray(input) ? 'an array' : typeof input;
    throw new TypeError(`validateFeedback: input must be an object, got ${got}`);
  }

  const rating = parseRating(input.rating);
  const topic = text(input.topic);
  const message = text(input.message);
  const email = text(input.email);
  const errors = {};

  if (rating === null) errors.rating = 'Choose a rating from 1 to 5';
  if (!FEEDBACK_TOPICS.includes(topic)) errors.topic = 'Choose a topic';
  if (charLength(message) < MESSAGE_MIN) errors.message = `Tell us a little more (at least ${MESSAGE_MIN} characters)`;
  else if (charLength(message) > MESSAGE_MAX) errors.message = `Keep it under ${MESSAGE_MAX} characters`;
  if (email && (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email))) {
    errors.email = 'Enter a valid email, or leave it blank';
  }

  if (Object.keys(errors).length) return { errors, value: null };
  return { errors, value: { rating, topic, message, email: email || null } };
}
