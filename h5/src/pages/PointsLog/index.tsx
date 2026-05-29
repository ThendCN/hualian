import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import styles from './style.module.scss';
import type { PointsLog } from '../../types';
import { getPointsLog, getProfile } from '../../services/api';

export default function PointsLogPage() {
  const [logs, setLogs] = useState<PointsLog[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    getProfile().then((data: any) => {
      if (data?.total_points !== undefined) setPoints(Number(data.total_points) || 0);
      else if (data?.points !== undefined) setPoints(Number(data.points) || 0);
    }).catch(() => {});
    getPointsLog().then((data: any) => {
      setLogs(Array.isArray(data) ? data : (data?.list ?? []));
    }).catch(() => {});
  }, []);

  const typeIcon: Record<string, string> = {
    earn: 'M12 4v16m8-8H4',
    spend: 'M20 12H4',
  };

  return (
    <div className={styles.page}>
      <NavBar title="积分明细" />
      <div className={styles.summary}>
        <div className={styles.summaryLabel}>当前可用积分</div>
        <div className={styles.summaryValue}>{points.toLocaleString()}</div>
      </div>
      <div className={styles.list}>
        {logs.map((log) => (
          <div key={log.id} className={styles.item}>
            <div className={`${styles.icon} ${log.type === 'earn' ? styles.iconEarn : styles.iconSpend}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d={typeIcon[log.type] ?? typeIcon.earn} />
              </svg>
            </div>
            <div className={styles.info}>
              <div className={styles.desc}>{log.description}</div>
              <div className={styles.time}>{new Date((log as any).createdAt || (log as any).created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className={`${styles.points} ${log.type === 'earn' ? styles.pointsEarn : styles.pointsSpend}`}>
              {log.type === 'earn' ? '+' : '-'}{Math.abs(log.points)}
            </div>
          </div>
        ))}
        {logs.length === 0 && <div className={styles.empty}>暂无POS积分明细记录</div>}
      </div>
    </div>
  );
}
