const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === 'string') message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((d) => d.msg).join(', ');
    } catch {
      // non-JSON error body; keep the generic message
    }
    throw new Error(message);
  }

  return res.status === 204 ? null : res.json();
}

export const tasksApi = {
  list: (limit) => request(limit ? `/tasks?limit=${limit}` : '/tasks'),
  stats: () => request('/tasks/stats'),
  create: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  complete: (id) => request(`/tasks/${id}/complete`, { method: 'PATCH' }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
