import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Nav.module.css';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className={styles.nav}>
      <NavLink to="/notes" className={styles.logo}>
        Study<span>Loop</span>
      </NavLink>

      <ul className={styles.links}>
        <li>
          <NavLink
            to="/notes"
            className={({ isActive }) => isActive ? styles.linkActive : styles.link}
          >
            Notes
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/sets"
            className={({ isActive }) => isActive ? styles.linkActive : styles.link}
          >
            Sets
          </NavLink>
        </li>

        {user && (
          <>
            <li>
              <NavLink
                to="/my-notes"
                className={({ isActive }) => isActive ? styles.linkActive : styles.link}
              >
                My Notes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/notes/new"
                className={({ isActive }) => isActive ? styles.linkActive : styles.link}
              >
                + Note
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/sets/new"
                className={({ isActive }) => isActive ? styles.linkActive : styles.link}
              >
                + Set
              </NavLink>
            </li>
          </>
        )}

        {user?.role === 'teacher' && (
          <li>
            <NavLink
              to="/review"
              className={({ isActive }) => isActive ? styles.linkActive : styles.link}
            >
              Review
            </NavLink>
          </li>
        )}
      </ul>

      <div className={styles.right}>
        {user ? (
          <>
            <span className={styles.userName}>
              {user.name}
              <span className={styles.role}>{user.role}</span>
            </span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={styles.link}>Log in</NavLink>
            <NavLink to="/register" className={`btn-primary ${styles.link}`}
              style={{ color: 'var(--text-inverse)', padding: '6px 16px', borderRadius: 'var(--radius-sm)' }}
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
