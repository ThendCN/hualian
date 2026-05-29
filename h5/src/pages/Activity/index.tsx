import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.scss';
import type { Activity, Announcement } from '../../types';
import { getActivities, getAnnouncements } from '../../services/api';

const tabs = ['全部', '进行中', '已结束'];

export default function ActivityPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    getActivities().then((data: any) => {
      setActivities(Array.isArray(data) ? data : (data?.list ?? []));
    }).catch(() => {});
    getAnnouncements().then((data: any) => {
      setAnnouncements(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const filtered = activeTab === 0
    ? activities
    : activities.filter((a) => (activeTab === 1 ? a.status === 'active' : a.status === 'ended'));

  const latestNotice = announcements[0];

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {tabs.map((t, i) => (
          <div
            key={t}
            className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {t}
          </div>
        ))}
      </div>

      {latestNotice && (
        <div className={styles.notice}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className={styles.noticeText}>{latestNotice.title}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      )}

      <div className={styles.list}>
        {filtered.map((a) => (
          <div key={a.id} className={styles.card} onClick={() => navigate(`/activity-detail/${a.id}`)}>
            <div className={`${styles.cardBanner} ${a.status === 'active' ? styles.bannerOrange : styles.bannerGold}`}>
              <div className={styles.bannerCircle} />
              <div className={styles.cardTitle}>{a.title}</div>
              <div className={styles.cardDate}>{a.start_time?.slice(0, 10)}{a.end_time ? ` - ${a.end_time.slice(0, 10)}` : ''}</div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardDesc}>{a.content?.slice(0, 50)}</div>
              <div className={styles.cardFooter}>
                <span className={`${styles.statusTag} ${a.status === 'active' ? styles.tagOrange : styles.tagGold}`}>
                  {a.status === 'active' ? '进行中' : a.status === 'ended' ? '已结束' : '即将开始'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className={styles.empty}>暂无活动</div>}
      </div>
    </div>
  );
}
