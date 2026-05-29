import { Outlet } from 'react-router-dom';
import TabBar from '../TabBar';
import styles from './style.module.scss';

export default function TabLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
