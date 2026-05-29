import { useNavigate } from 'react-router-dom';
import type { Member } from '../../types';
import { getLevelName } from '../../utils/level';
import styles from './style.module.scss';

interface MemberCardProps {
  member: Member;
  couponCount?: number;
}

export default function MemberCard({ member, couponCount = 0 }: MemberCardProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.glow} />
      <div className={styles.top}>
        <div className={styles.left}>
          <div className={styles.titleRow}>
            <span className={styles.brandName}>华联会员</span>
            <span className={styles.levelBadge}>{getLevelName(member.level)}</span>
          </div>
          <div className={styles.memberId}>NO. {member.member_no}</div>
        </div>
        <div className={styles.right}>
          <div className={styles.points}>{member.total_points.toLocaleString()}</div>
          <div className={styles.pointsLabel}>可用积分</div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>年消费</span>
          <span className={styles.statValue}>¥{member.year_consumed.toLocaleString()}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>优惠券</span>
          <span className={styles.statValueGold}>{couponCount}张</span>
        </div>
        <button className={styles.codeBtn} onClick={() => navigate('/member-code')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 3v18" />
          </svg>
          <span>会员码</span>
        </button>
      </div>
    </div>
  );
}
