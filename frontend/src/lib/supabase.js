import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Without credentials the app runs in local demo mode, so the client is null.
// To connect, copy frontend/.env.example to frontend/.env.local.
// No login in this app, so there is no session to persist.
export const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
