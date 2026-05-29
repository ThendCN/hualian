import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.scss';
import { getProfile } from '../../services/api';
import { getLevelName } from '../../utils/level';

const menuItems = [
  { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: '我的车辆', color: 'var(--gold)', path: '/vehicles' },
  { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: '积分明细', color: 'var(--primary)', path: '/points-log' },
  { icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', label: '消费记录', color: '#34A853', path: '/consumption' },
  { icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z', label: '我的优惠券', color: 'var(--primary)', path: '/coupons' },
  { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', label: '我的收藏', color: '#E85C3A', path: '/favorites' },
  { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: '设置', color: 'var(--ink3)', path: '/settings' },
];

export default function MinePage() {
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      getProfile().then((data: any) => setMember(data)).catch(() => {});
    }
  }, [token]);

  if (!token || !member) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerGlow} />
          <div className={styles.profile} onClick={() => navigate('/login')}>
            <div className={styles.avatar}>?</div>
            <div className={styles.profileInfo}>
              <div className={styles.nameRow}>
                <span className={styles.name}>点击登录</span>
              </div>
              <div className={styles.nextLevel}>登录后享受会员专属权益</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initial = member.nickname?.[0] ?? 'M';
  const levelName = getLevelName(member.level);
  const stats = [
    { value: member.total_points?.toLocaleString() ?? '0', label: '积分' },
    { value: member.coupon_count ?? '0', label: '优惠券' },
    { value: '—', label: '收藏' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerGlow} />
        <div className={styles.profile}>
          <div className={styles.avatar}>{initial}</div>
          <div className={styles.profileInfo}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{member.nickname}</span>
              <span className={styles.levelBadge}>{levelName}</span>
            </div>
            <div className={styles.nextLevel}>年消费 ¥{member.year_consumed?.toLocaleString() ?? 0}</div>
          </div>
        </div>
        <div className={styles.statsRow}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.menuWrap}>
        <div className={styles.menuCard}>
          {menuItems.map((m, i) => (
            <div
              key={m.label}
              className={styles.menuItem}
              style={{ borderBottom: i < menuItems.length - 1 ? '1px solid var(--border)' : 'none' }}
              onClick={() => navigate(m.path)}
            >
              <div className={styles.menuLeft}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={m.icon} />
                </svg>
                <span className={styles.menuLabel}>{m.label}</span>
              </div>
              <div className={styles.menuRight}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
