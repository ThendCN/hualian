import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import { getAnnouncements } from '../../services/api';
import styles from './style.module.scss';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  is_top: boolean;
  publish_at: string;
  created_at: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function iconColor(type: string): string {
  if (type === 'promotion') return 'var(--primary)';
  if (type === 'notice') return 'var(--gold)';
  return '#4285F4';
}

function BellIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function MessagesPage() {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnnouncements()
      .then((res: unknown) => {
        if (Array.isArray(res)) {
          setList(res as Announcement[]);
        } else if (res && typeof res === 'object' && Array.isArray((res as { list: unknown[] }).list)) {
          setList((res as { list: Announcement[] }).list);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <NavBar title="消息通知" />
      {loading ? null : list.length === 0 ? (
        <div className={styles.empty}>暂无消息</div>
      ) : (
        <div className={styles.list}>
          {list.map((item) => (
            <div key={item.id} className={styles.card}>
              <div
                className={styles.iconWrap}
                style={{ background: `${iconColor(item.type)}1a` }}
              >
                <BellIcon color={iconColor(item.type)} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.titleRow}>
                  <span className={styles.title}>{item.title}</span>
                  {item.is_top && <span className={styles.pinTag}>置顶</span>}
                </div>
                <div className={styles.content}>
                  {item.content.slice(0, 50)}
                </div>
                <div className={styles.date}>{formatDate(item.publish_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
