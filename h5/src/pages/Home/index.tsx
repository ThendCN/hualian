import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberCard from '../../components/MemberCard';
import styles from './style.module.scss';
import type { Member, Activity, Product } from '../../types';
import { getProfile, getActivities, getProducts } from '../../services/api';

const shortcuts = [
  { label: '积分停车', path: '/parking', iconColor: '#fff', bg: 'linear-gradient(135deg,#C5963A,#E8B960)', hot: true, shadow: '0 4px 12px rgba(197,150,58,0.3)', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: '优惠券', path: '/coupons', iconColor: 'var(--primary)', bg: 'var(--primary-light)', hot: false, shadow: 'none', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  { label: '活动', path: '/activity', iconColor: '#34A853', bg: '#F0F9F0', hot: false, shadow: 'none', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: '商城', path: '/mall', iconColor: '#4285F4', bg: '#EEF3FE', hot: false, shadow: 'none', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [member, setMember] = useState<Member | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      getProfile().then((data: any) => setMember(data)).catch(() => {});
    }
    getActivities({ limit: 2 }).then((data: any) => {
      setActivities(Array.isArray(data) ? data.slice(0, 2) : (data?.list ?? []));
    }).catch(() => {});
    getProducts({ is_hot: true, limit: 6 }).then((data: any) => {
      setProducts(Array.isArray(data) ? data : (data?.list ?? []));
    }).catch(() => {});
  }, [token]);

  const banners = activities.length > 0
    ? activities.map((a) => ({ title: a.title, sub: a.content?.slice(0, 30) ?? '', btn: '立即参与', id: a.id }))
    : [{ title: '华联商城欢迎您', sub: '精选好物，积分好礼', btn: '去逛逛', id: 0 }];

  return (
    <div className={styles.page}>
      <div className={styles.cardWrap}>
        {member ? (
          <MemberCard member={member} couponCount={0} />
        ) : (
          <div className={styles.loginCard} onClick={() => navigate('/login')}>
            <div className={styles.loginHint}>点击登录，享受会员专属权益</div>
          </div>
        )}
      </div>

      {/* Banner */}
      <div className={styles.bannerWrap}>
        <div className={styles.banner}>
          <div className={styles.bannerCircle} />
          <div className={styles.bannerTitle}>{banners[bannerIndex].title}</div>
          <div className={styles.bannerSub}>{banners[bannerIndex].sub}</div>
          <div
            className={styles.bannerBtn}
            onClick={() => banners[bannerIndex].id ? navigate(`/activity-detail/${banners[bannerIndex].id}`) : navigate('/activity')}
          >
            {banners[bannerIndex].btn}
          </div>
          <div className={styles.bannerDots}>
            {banners.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === bannerIndex ? styles.dotActive : ''}`}
                onClick={() => setBannerIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className={styles.shortcuts}>
        {shortcuts.map((s) => (
          <div key={s.label} className={styles.shortcut} onClick={() => navigate(s.path)}>
            <div className={styles.shortcutIcon} style={{ background: s.bg, boxShadow: s.shadow }}>
              {s.hot && <span className={styles.hotTag}>HOT</span>}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={s.icon} />
              </svg>
            </div>
            <span className={styles.shortcutLabel} style={{ fontWeight: s.hot ? 600 : 400 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* 热门活动 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>热门活动</span>
          <span className={styles.sectionMore} onClick={() => navigate('/activity')}>查看全部 ›</span>
        </div>
        {activities.map((a) => (
          <div key={a.id} className={styles.activityCard} onClick={() => navigate(`/activity-detail/${a.id}`)}>
            <div className={styles.activityInfo}>
              <span className={styles.activityTitle}>{a.title}</span>
              <span className={`${styles.activityTag} ${a.status === 'active' ? styles.tagOngoing : styles.tagUpcoming}`}>
                {a.status === 'active' ? '进行中' : '即将开始'}
              </span>
            </div>
            <div className={styles.activitySub}>{a.content?.slice(0, 30)}</div>
          </div>
        ))}
        {activities.length === 0 && <div className={styles.activityCard}><div className={styles.activityInfo}><span className={styles.activityTitle}>暂无活动</span></div></div>}
      </div>

      {/* 热销推荐 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>热销推荐</span>
          <span className={styles.sectionMore} onClick={() => navigate('/mall')}>更多 ›</span>
        </div>
        <div className={styles.productScroll}>
          {products.map((p) => (
            <div key={p.id} className={styles.productCard} onClick={() => navigate(`/product/${p.id}`)}>
              <div className={styles.productImg}>
                <span>商品图</span>
              </div>
              <div className={styles.productInfo}>
                <div className={styles.productName}>{p.name}</div>
                <div className={styles.productPrice}>¥{p.price}</div>
                <div className={styles.productMeta}>{p.merchant?.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
