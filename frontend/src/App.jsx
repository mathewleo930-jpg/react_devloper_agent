import { Navigate, Route, Routes } from 'react-router-dom';
import useTheme from './hooks/useTheme.js';
import AppLayout from './layouts/AppLayout.jsx';
import Board from './pages/Board.jsx';
import Customers from './pages/Customers.jsx';
import Landing from './pages/Landing.jsx';
import NewTicket from './pages/NewTicket.jsx';
import Overview from './pages/Overview.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Team from './pages/Team.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Tickets from './pages/Tickets.jsx';
import { TicketProvider } from './store/TicketStore.jsx';

export default function App({ initialState, remote }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <TicketProvider initialState={initialState} remote={remote}>
      <Routes>
        <Route path="/" element={<Landing theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/app" element={<AppLayout theme={theme} onToggleTheme={toggleTheme} />}>
          <Route index element={<Overview />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/new" element={<NewTicket />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="board" element={<Board />} />
          <Route path="customers" element={<Customers />} />
          <Route path="team" element={<Team />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TicketProvider>
  );
}
