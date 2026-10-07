import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import AddTask from './pages/AddTask.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import useTheme from './hooks/useTheme.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">Task Manager</Link>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks/new" element={<AddTask />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
