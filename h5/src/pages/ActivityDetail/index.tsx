import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import styles from './style.module.scss';
import { getActivity, claimCoupon } from '../../services/api';

interface ActivityDetail {
  id: number;
  title: string;
  content?: string;
  start_time: string;
  end_time?: string;
  status: string;
  couponTemplateId?: number;
  couponTemplateName?: string;
}

export default function ActivityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (id) {
      getActivity(Number(id)).then((data: any) => setActivity(data)).catch(() => {});
    }
  }, [id]);

  const handleClaim = async () => {
    if (!activity?.couponTemplateId || claiming || claimed) return;
    setClaiming(true);
    try {
      await claimCoupon(activity.couponTemplateId);
      setClaimed(true);
    } catch {
      // ignore
    } finally {
      setClaiming(false);
    }
  };

  if (!activity) {
    return (
      <div className={styles.page}>
        <NavBar title="活动详情" />
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <NavBar title="活动详情" />
      <div className={`${styles.banner} ${activity.status === 'active' ? styles.bannerOrange : styles.bannerGold}`}>
        <div className={styles.bannerCircle} />
        <div className={styles.bannerTitle}>{activity.title}</div>
        <div className={styles.bannerDate}>{activity.start_time?.slice(0, 10)}{activity.end_time ? ` - ${activity.end_time.slice(0, 10)}` : ''}</div>
      </div>
      <div className={styles.body}>
        {activity.content && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>活动介绍</div>
            <div className={styles.desc}>{activity.content}</div>
          </div>
        )}
        {activity.couponTemplateId && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>专属优惠</div>
            <div className={styles.couponCard}>
              <div className={styles.couponLeft}>
                <div className={styles.couponValue}>{activity.couponTemplateName ?? '专属优惠券'}</div>
                <div className={styles.couponSub}>活动专属券</div>
              </div>
              <button
                className={styles.couponGetBtn}
                onClick={handleClaim}
                disabled={claiming || claimed}
              >
                {claimed ? '已领取' : claiming ? '领取中...' : '立即领取'}
              </button>
            </div>
          </div>
        )}
        <button className={styles.joinBtn} onClick={() => navigate('/mall')}>
          前往商城参与
        </button>
      </div>
    </div>
  );
}
