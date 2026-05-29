import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import request from '../../services/api';
import styles from './style.module.scss';

interface ConsumptionRecord {
  id: number;
  pos_order_id: string;
  amount: number;
  store_name: string;
  points_earned: number;
  consumed_at: string;
}

function formatMonth(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}年${month}月`;
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function ConsumptionPage() {
  const [grouped, setGrouped] = useState<Record<string, ConsumptionRecord[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request.get('/consumption')
      .then((data: any) => {
        const records: ConsumptionRecord[] = data.list ?? [];
        const map = records.reduce<Record<string, ConsumptionRecord[]>>((acc, item) => {
          const month = formatMonth(item.consumed_at);
          if (!acc[month]) acc[month] = [];
          acc[month].push(item);
          return acc;
        }, {});
        setGrouped(map);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <NavBar title="消费记录" />
      <div className={styles.list}>
        {loading && <div className={styles.empty}>加载中...</div>}
        {!loading && Object.keys(grouped).length === 0 && (
          <div className={styles.empty}>暂无POS消费明细记录</div>
        )}
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <div className={styles.monthHeader}>{month}</div>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.merchantIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className={styles.info}>
                  <div className={styles.merchantName}>{item.store_name}</div>
                  <div className={styles.time}>{formatTime(item.consumed_at)}</div>
                </div>
                <div className={styles.right}>
                  <div className={styles.amount}>-¥{item.amount}</div>
                  <div className={styles.pointsEarned}>+{item.points_earned}积分</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
