import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import request from '../../services/api';
import styles from './style.module.scss';

interface ParkingRecord {
  id: number;
  plateNumber: string;
  entryTime: string;
  exitTime?: string;
  duration?: number;
  fee: number;
  pointsUsed: number;
  status: 'parking' | 'completed';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h${m > 0 ? m + 'm' : ''}`;
  return `${m}分钟`;
}

export default function ParkingRecordsPage() {
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request.get('/parking/records')
      .then((d: any) => setRecords(Array.isArray(d) ? d : []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <NavBar title="停车记录" />

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : records.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p>暂无停车记录</p>
          </div>
        ) : (
          <div className={styles.list}>
            {records.map((r) => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.plate}>{r.plateNumber}</span>
                  <span className={`${styles.status} ${r.status === 'parking' ? styles.statusParking : styles.statusDone}`}>
                    {r.status === 'parking' ? '停车中' : '已完成'}
                  </span>
                </div>

                <div className={styles.times}>
                  <div className={styles.timeRow}>
                    <span className={styles.timeLabel}>入场</span>
                    <span className={styles.timeVal}>{formatTime(r.entryTime)}</span>
                  </div>
                  {r.exitTime && (
                    <div className={styles.timeRow}>
                      <span className={styles.timeLabel}>出场</span>
                      <span className={styles.timeVal}>{formatTime(r.exitTime)}</span>
                    </div>
                  )}
                  {r.duration !== undefined && (
                    <div className={styles.timeRow}>
                      <span className={styles.timeLabel}>时长</span>
                      <span className={styles.timeVal}>{formatDuration(r.duration)}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardBottom}>
                  <div className={styles.feeInfo}>
                    <span className={styles.feeLabel}>停车费</span>
                    <span className={styles.feeVal}>¥{r.fee.toFixed(2)}</span>
                  </div>
                  {r.pointsUsed > 0 && (
                    <div className={styles.pointsInfo}>
                      <span className={styles.pointsLabel}>积分抵扣</span>
                      <span className={styles.pointsVal}>-{r.pointsUsed}分 (-¥{(r.pointsUsed / 100).toFixed(2)})</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
