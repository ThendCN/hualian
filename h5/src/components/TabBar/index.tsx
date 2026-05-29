import { useNavigate, useLocation } from 'react-router-dom';
import styles from './style.module.scss';

const tabs = [
  {
    path: '/',
    label: '首页',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
          stroke={active ? 'var(--primary)' : '#999'}
          strokeWidth="1.8"
          fill={active ? 'var(--primary-light)' : 'none'}
        />
        <path
          d="M9 21V12h6v9"
          stroke={active ? 'var(--primary)' : '#999'}
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    path: '/mall',
    label: '商城',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
          stroke={active ? 'var(--primary)' : '#999'}
          strokeWidth="1.8"
          fill={active ? 'var(--primary-light)' : 'none'}
        />
        <path d="M3 6h18" stroke={active ? 'var(--primary)' : '#999'} strokeWidth="1.8" />
        <path
          d="M16 10a4 4 0 01-8 0"
          stroke={active ? 'var(--primary)' : '#999'}
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    path: '/activity',
    label: '活动',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="4" width="18" height="18" rx="2"
          stroke={active ? 'var(--primary)' : '#999'}
          strokeWidth="1.8"
          fill={active ? 'var(--primary-light)' : 'none'}
        />
        <path d="M16 2v4M8 2v4M3 10h18" stroke={active ? 'var(--primary)' : '#999'} strokeWidth="1.8" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke={active ? 'var(--primary)' : '#999'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/mine',
    label: '我的',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="4"
          stroke={active ? 'var(--primary)' : '#999'}
          strokeWidth="1.8"
          fill={active ? 'var(--primary-light)' : 'none'}
        />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke={active ? 'var(--primary)' : '#999'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.icon(active)}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
