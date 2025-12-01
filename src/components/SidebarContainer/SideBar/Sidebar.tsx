import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar">
      <nav className="sidebar__nav">
        <button
          className={`sidebar__nav-item ${
            isActive('/employee-list') ? 'sidebar__nav-item--active' : ''
          }`}
          onClick={() => navigate('/employee-list')}
          aria-label="View employee list"
          title="Employee List"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="sidebar__nav-label">Employees</span>
        </button>

        <button
          className={`sidebar__nav-item ${
            isActive('/org-chart') ? 'sidebar__nav-item--active' : ''
          }`}
          onClick={() => navigate('/org-chart')}
          aria-label="View organization chart"
          title="Organization Chart"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="sidebar__nav-label">Structure</span>
        </button>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user-info">
          <div className="sidebar__user-avatar">JD</div>
          <div className="sidebar__user-details">
            <p className="sidebar__user-name">John Doe</p>
            <p className="sidebar__user-role">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}