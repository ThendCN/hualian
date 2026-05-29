import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import styles from './style.module.scss';
import type { MemberCoupon } from '../../types';
import { getMemberCoupons } from '../../services/api';

const tabs = ['可用', '已用', '已过期'];
const statusMap: Record<string, MemberCoupon['status']> = { '可用': 'unused', '已用': 'used', '已过期': 'expired' };

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [coupons, setCoupons] = useState<MemberCoupon[]>([]);

  useEffect(() => {
    getMemberCoupons().then((data: any) => {
      setCoupons(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const filtered = coupons.filter((c) => c.status === statusMap[tabs[activeTab]]);

  return (
    <div className={styles.page}>
      <NavBar title="我的优惠券" />
      <div className={styles.tabBar}>
        {tabs.map((t, i) => (
          <div key={t} className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`} onClick={() => setActiveTab(i)}>
            {t}
          </div>
        ))}
      </div>
      <div className={styles.list}>
        {filtered.map((c) => (
          <div key={c.id} className={`${styles.coupon} ${c.status !== 'unused' ? styles.couponDim : ''}`}>
            <div className={styles.couponLeft}>
              <div className={styles.couponValue}>
                {c.type === 'cash' ? `¥${c.value}` : `${c.value}折`}
              </div>
              <div className={styles.couponCond}>
                {c.minAmount ? `满${c.minAmount}可用` : '无门槛'}
              </div>
            </div>
            <div className={styles.couponDivider} />
            <div className={styles.couponRight}>
              <div className={styles.couponName}>{c.name}</div>
              <div className={styles.couponExpire}>有效期至 {c.expireAt?.slice(0, 10)}</div>
              {c.status === 'unused' && <div className={styles.useBtn}>立即使用</div>}
              {c.status === 'used' && <div className={styles.usedTag}>已使用</div>}
              {c.status === 'expired' && <div className={styles.expiredTag}>已过期</div>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={styles.empty}>暂无{tabs[activeTab]}优惠券</div>
        )}
      </div>
    </div>
  );
}
