import { supabase } from '../lib/supabase.js';

const MAX_LIMIT = 500;

// Supabase returns { data, error } instead of throwing; callers expect a throw.
async function unwrap(query) {
  const { data, error } = await query;
  if (error) throw new Error(error.message || 'Request failed');
  return data;
}

async function requireRow(query, id) {
  const row = await unwrap(query);
  if (!row) throw new Error(`Task ${id} not found`);
  return row;
}

export const tasksApi = {
  list: (limit) =>
    unwrap(
      supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(Math.min(limit ?? MAX_LIMIT, MAX_LIMIT)),
    ),
  stats: () => unwrap(supabase.from('task_stats').select('total, pending, completed').single()),
  create: ({ title, description }) =>
    unwrap(
      supabase
        .from('tasks')
        .insert({ title: title.trim(), description: description?.trim() || null })
        .select()
        .single(),
    ),
  complete: (id) =>
    requireRow(supabase.from('tasks').update({ status: 'completed' }).eq('id', id).select().maybeSingle(), id),
  remove: async (id) => {
    await requireRow(supabase.from('tasks').delete().eq('id', id).select('id').maybeSingle(), id);
    return null;
  },
};
