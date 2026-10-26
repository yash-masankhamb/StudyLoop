import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import styles from '../styles/Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Nav />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
