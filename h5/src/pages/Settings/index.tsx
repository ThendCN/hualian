import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import styles from './style.module.scss';

const ChevronRight = () => (
  <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function SettingsPage() {
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem('token');

  const handleClearCache = () => {
    alert('缓存已清除');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.page}>
      <NavBar title="设置" />

      <div className={styles.menuCard}>
        <div className={styles.menuItem}>
          <span className={styles.menuLabel}>个人信息</span>
          <ChevronRight />
        </div>
        <div className={styles.menuItem}>
          <span className={styles.menuLabel}>关于华联</span>
          <ChevronRight />
        </div>
        <div className={styles.menuItem} onClick={handleClearCache}>
          <span className={styles.menuLabel}>清除缓存</span>
          <ChevronRight />
        </div>
      </div>

      {hasToken && (
        <div className={styles.menuCard}>
          <div className={styles.menuItem} onClick={handleLogout}>
            <span className={styles.menuLabelDanger}>退出登录</span>
            <ChevronRight />
          </div>
        </div>
      )}
    </div>
  );
}
