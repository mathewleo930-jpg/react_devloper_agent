import { supabase } from '../lib/supabase.js';
import { DEFAULT_PRIORITY, PRIORITIES } from '../priority.js';

const MAX_LIMIT = 500;

// Supabase returns { data, error } instead of throwing; callers expect a throw.
async function unwrap(query) {
  const { data, error } = await query;
  if (error) throw new Error(error.message || 'Request failed');
  return data;
}

// Thrown when a task is missing or soft-deleted, so callers can tell it apart from other failures.
export class TaskNotFoundError extends Error {}

async function requireRow(query, id) {
  const row = await unwrap(query);
  if (!row) throw new TaskNotFoundError(`Task ${id} not found`);
  return row;
}

function requireValidId(id) {
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid task id "${id}"`);
}

function requireValidPriority(priority) {
  if (!PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority "${priority}"; expected one of ${PRIORITIES.join(', ')}`);
  }
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
  get: async (id) => {
    requireValidId(id);
    return requireRow(supabase.from('tasks').select('*').eq('id', id).is('deleted_at', null).maybeSingle(), id);
  },
  create: async ({ title, description, priority = DEFAULT_PRIORITY }) => {
    requireValidPriority(priority);
    return unwrap(
      supabase
        .from('tasks')
        .insert({ title: title.trim(), description: description?.trim() || null, priority })
        .select()
        .single(),
    );
  },
  // Filtering on deleted_at means a task deleted while its edit form was open is not saved.
  update: async (id, { title, description, priority }) => {
    requireValidId(id);
    if (!title?.trim()) throw new Error('Title is required');
    requireValidPriority(priority);
    return requireRow(
      supabase
        .from('tasks')
        .update({ title: title.trim(), description: description?.trim() || null, priority })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .maybeSingle(),
      id,
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
  listDeleted: (limit) =>
    unwrap(
      supabase
        .from('tasks')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(Math.min(limit ?? MAX_LIMIT, MAX_LIMIT)),
    ),
  // Only deleted_at is cleared, so status and priority come back unchanged on the Dashboard.
  restore: async (id) => {
    requireValidId(id);
    return requireRow(
      supabase
        .from('tasks')
        .update({ deleted_at: null })
        .eq('id', id)
        .not('deleted_at', 'is', null)
        .select()
        .maybeSingle(),
      id,
    );
  },
};
