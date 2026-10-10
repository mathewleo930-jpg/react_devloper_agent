import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import AddTask from './pages/AddTask.jsx';
import Analytics from './pages/Analytics.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import NotificationBell from './components/NotificationBell.jsx';
import useTheme from './hooks/useTheme.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">Task Manager</Link>
        <nav aria-label="Main" className="nav">
          <NavLink to="/" end className="nav-link">Dashboard</NavLink>
          <NavLink to="/analytics" className="nav-link">Analytics</NavLink>
        </nav>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <NotificationBell />
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/tasks/new" element={<AddTask />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
