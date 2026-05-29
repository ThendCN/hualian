import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import styles from './style.module.scss';
import { getQrcode, getProfile } from '../../services/api';

interface QrcodeData {
  qrcode?: string;
  barcode?: string;
  memberId?: string;
}

export default function MemberCodePage() {
  const navigate = useNavigate();
  const [qrData, setQrData] = useState<QrcodeData | null>(null);
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    getProfile().then((data: any) => setMember(data)).catch(() => {});
    getQrcode().then((data: any) => setQrData(data)).catch(() => {});
  }, [navigate]);

  const initial = member?.nickname?.[0] ?? 'M';

  return (
    <div className={styles.page}>
      <NavBar title="会员码" />
      <div className={styles.content}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.nickname}>{member?.nickname ?? '会员'}</div>
        <div className={styles.levelBadge}>{member?.levelName ?? '普通会员'}</div>

        <div className={styles.codeCard}>
          <div className={styles.barcodeArea}>
            <div className={styles.barcodeMock}>
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className={styles.bar} style={{ width: i % 3 === 0 ? 3 : 1 }} />
              ))}
            </div>
            <div className={styles.barcodeNum}>{qrData?.barcode ?? member?.memberId ?? '- - -'}</div>
          </div>

          <div className={styles.qrArea}>
            <div className={styles.qrMock}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="4" y="4" width="28" height="28" rx="3" stroke="var(--ink)" strokeWidth="3" fill="none" />
                <rect x="12" y="12" width="12" height="12" rx="1" fill="var(--ink)" />
                <rect x="48" y="4" width="28" height="28" rx="3" stroke="var(--ink)" strokeWidth="3" fill="none" />
                <rect x="56" y="12" width="12" height="12" rx="1" fill="var(--ink)" />
                <rect x="4" y="48" width="28" height="28" rx="3" stroke="var(--ink)" strokeWidth="3" fill="none" />
                <rect x="12" y="56" width="12" height="12" rx="1" fill="var(--ink)" />
                <rect x="48" y="48" width="8" height="8" rx="1" fill="var(--ink)" />
                <rect x="60" y="48" width="8" height="8" rx="1" fill="var(--ink)" />
                <rect x="48" y="60" width="8" height="8" rx="1" fill="var(--ink)" />
                <rect x="60" y="60" width="8" height="8" rx="1" fill="var(--ink)" />
              </svg>
            </div>
            <div className={styles.qrHint}>扫码核销</div>
          </div>
        </div>

        <div className={styles.memberId}>会员编号：{member?.memberId ?? qrData?.memberId ?? '---'}</div>
      </div>
    </div>
  );
}
