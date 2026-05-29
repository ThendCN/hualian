import { useNavigate } from 'react-router-dom';
import styles from './style.module.scss';

interface NavBarProps {
  title: string;
  back?: boolean;
  right?: React.ReactNode;
}

export default function NavBar({ title, back = true, right }: NavBarProps) {
  const navigate = useNavigate();

  return (
    <header className={styles.navBar}>
      {back && (
        <button className={styles.back} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>{right}</div>
    </header>
  );
}
