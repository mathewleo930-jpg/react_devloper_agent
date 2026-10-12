function assertFiniteNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number, got ${String(value)}`);
  }
}

function assertNonNegativeAmount(amount) {
  assertFiniteNumber(amount, 'amount');
  if (amount < 0) {
    throw new RangeError(`amount must not be negative, got ${amount}`);
  }
}

export function applyDiscount(amount, percentOff) {
  assertNonNegativeAmount(amount);
  assertFiniteNumber(percentOff, 'percentOff');
  if (percentOff < 0 || percentOff > 100) {
    throw new RangeError(`percentOff must be between 0 and 100, got ${percentOff}`);
  }
  // Work in cents so results like 29 × 0.9 do not carry float noise (26.099999…).
  return Math.round(amount * 100 * (100 - percentOff) / 100) / 100;
}

export function formatPrice(amount) {
  assertNonNegativeAmount(amount);
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}
