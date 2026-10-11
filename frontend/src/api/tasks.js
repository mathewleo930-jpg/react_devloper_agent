import { supabase } from '../lib/supabase.js';
import { DEFAULT_PRIORITY, PRIORITIES } from '../priority.js';

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
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(Math.min(limit ?? MAX_LIMIT, MAX_LIMIT)),
    ),
  stats: () => unwrap(supabase.from('task_stats').select('total, pending, completed, deleted').single()),
  create: async ({ title, description, priority = DEFAULT_PRIORITY }) => {
    if (!PRIORITIES.includes(priority)) {
      throw new Error(`Invalid priority "${priority}"; expected one of ${PRIORITIES.join(', ')}`);
    }
    return unwrap(
      supabase
        .from('tasks')
        .insert({ title: title.trim(), description: description?.trim() || null, priority })
        .select()
        .single(),
    );
  },
  complete: (id) =>
    requireRow(
      supabase.from('tasks').update({ status: 'completed' }).eq('id', id).is('deleted_at', null).select().maybeSingle(),
      id,
    ),
  reopen: (id) =>
    requireRow(
      supabase.from('tasks').update({ status: 'pending' }).eq('id', id).is('deleted_at', null).select().maybeSingle(),
      id,
    ),
  // Soft delete: the row stays so the Analytics tab can count deleted tasks.
  remove: async (id) => {
    await requireRow(
      supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .is('deleted_at', null)
        .select('id')
        .maybeSingle(),
      id,
    );
    return null;
  },
};
