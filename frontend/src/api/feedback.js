import { validateFeedback } from '../lib/feedback.js';
import { supabase } from '../lib/supabase.js';

export const FEEDBACK_STORAGE_KEY = 'deskline:feedback:v1';
export const LOCAL_LIMIT = 50;

function readLocal(storage) {
  try {
    const entries = JSON.parse(storage.getItem(FEEDBACK_STORAGE_KEY));
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

// Resolves once saved; rejects with an Error on failure. Anon may insert but
// not read feedback (it can hold emails), so the insert selects nothing back.
export async function submitFeedback(value, { client = supabase, storage = globalThis.localStorage, now = Date.now } = {}) {
  const { errors, value: entry } = validateFeedback(value);
  const invalid = Object.keys(errors);
  if (invalid.length) {
    const details = invalid.map((field) => `${field}=${JSON.stringify(value[field])}`).join(', ');
    throw new TypeError(`submitFeedback: invalid ${details}`);
  }

  if (client) {
    const { error } = await client.from('feedback').insert(entry);
    if (error) throw new Error(error.message || 'Request failed');
    return;
  }

  if (!storage) throw new Error('submitFeedback: no Supabase client and no localStorage available');
  const entries = [...readLocal(storage), { ...entry, createdAt: now() }].slice(-LOCAL_LIMIT);
  storage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(entries));
}
