import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isRemote, ticketsApi } from '../api/tickets.js';
import { CURRENT_AGENT_ID, createSeedState } from '../data/mockData.js';
import { ticketReducer } from './ticketReducer.js';

export const STORAGE_KEY = 'deskline:v1';
const EMPTY = { tickets: [], agents: [], customers: [], currentAgentId: CURRENT_AGENT_ID };

function loadLocal() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.tickets)) return saved;
  } catch {
    // Unreadable or blocked storage falls back to fresh demo data.
  }
  return createSeedState();
}

const TicketContext = createContext(null);
const ToastContext = createContext(() => {});

// Local demo mode keeps state in localStorage. With Supabase configured, every
// change is applied on screen first, then the changed tickets are written; a
// failed write reloads the workspace so the screen matches the database.
export function TicketProvider({ children, initialState, remote = isRemote }) {
  const [state, setState] = useState(() => initialState ?? (remote ? null : loadLocal()));
  const [status, setStatus] = useState(state ? 'ready' : 'loading');
  const stateRef = useRef(state);
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const commit = useCallback((next) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const notify = useCallback((message, tone = 'default') => {
    clearTimeout(timer.current);
    setToast({ message, tone, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const load = useCallback(() => {
    setStatus('loading');
    ticketsApi.loadWorkspace().then(
      (workspace) => {
        commit({ ...workspace, currentAgentId: CURRENT_AGENT_ID });
        setStatus('ready');
      },
      () => setStatus('error'),
    );
  }, [commit]);

  useEffect(() => {
    if (remote && !stateRef.current) load();
  }, [remote, load]);

  useEffect(() => {
    if (remote || !state) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Best-effort: the demo still works for this session without storage.
    }
  }, [remote, state]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const failSave = useCallback(() => {
    notify('Couldn’t save to the database. Reloaded the latest data.', 'error');
    load();
  }, [notify, load]);

  // Runs the reducer and, when remote, persists every ticket that changed.
  const dispatch = useCallback(
    (action) => {
      const prev = stateRef.current;
      const next = ticketReducer(prev, { now: Date.now(), ...action });
      commit(next);
      if (!remote) return next;
      const before = new Map(prev.tickets.map((t) => [t.id, t]));
      const changed = next.tickets.filter((t) => before.has(t.id) && before.get(t.id) !== t);
      Promise.all(changed.map((t) => ticketsApi.saveTicketDiff(before.get(t.id), t))).catch(failSave);
      return next;
    },
    [commit, remote, failSave],
  );

  // Resolves to the new ticket's id. Remote tickets get their number from the database.
  const createTicket = useCallback(
    async (payload) => {
      const now = Date.now();
      if (!remote) return dispatch({ type: 'createTicket', payload, now }).tickets[0].id;
      const draft = ticketReducer(stateRef.current, { type: 'createTicket', payload, now }).tickets[0];
      const number = await ticketsApi.createTicket(draft);
      return dispatch({ type: 'createTicket', payload, number, now }).tickets[0].id;
    },
    [dispatch, remote],
  );

  const value = useMemo(() => {
    const s = state ?? EMPTY;
    const agentsById = Object.fromEntries(s.agents.map((a) => [a.id, a]));
    const customersById = Object.fromEntries(s.customers.map((c) => [c.id, c]));
    return {
      ...s,
      agentsById,
      customersById,
      currentAgent: agentsById[s.currentAgentId],
      status,
      remote,
      reload: load,
      dispatch,
      createTicket,
    };
  }, [state, status, remote, load, dispatch, createTicket]);

  return (
    <TicketContext.Provider value={value}>
      <ToastContext.Provider value={notify}>
        {children}
        <div className="toast-region" role="status" aria-live="polite">
          {toast && (
            <div className={`toast toast-${toast.tone}`} key={toast.key}>
              <span className="toast-dot" aria-hidden="true" />
              {toast.message}
            </div>
          )}
        </div>
      </ToastContext.Provider>
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used inside <TicketProvider>');
  return ctx;
}

export const useToast = () => useContext(ToastContext);
