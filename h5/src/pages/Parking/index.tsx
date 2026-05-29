import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import request from '../../services/api';
import styles from './style.module.scss';

interface Vehicle {
  id: number;
  plate_number: string;
  plate_color: string;
  is_default: boolean;
}

interface ParkingInfo {
  parking_order_id: string;
  plate_number: string;
  entry_time: string;
  duration: number;
  fee: number;
}

interface MemberProfile {
  points: number;
  nickname: string;
}

const POINTS_RATE = 100;

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}小时${m > 0 ? m + '分钟' : ''}`;
  return `${m}分钟`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ParkingPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedPlate, setSelectedPlate] = useState('');
  const [manualPlate, setManualPlate] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [parkingInfo, setParkingInfo] = useState<ParkingInfo | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [deductPoints, setDeductPoints] = useState(0);
  const [deducting, setDeducting] = useState(false);
  const [deductSuccess, setDeductSuccess] = useState(false);
  const [deductResult, setDeductResult] = useState<{ pointsUsed: number; deductedAmount: number; remainFee: number } | null>(null);

  useEffect(() => {
    request.get('/member/profile').then((d: any) => setProfile(d)).catch(() => {});
    request.get('/vehicles').then((d: any) => {
      const list = Array.isArray(d) ? d : [];
      setVehicles(list);
      const def = list.find((v: Vehicle) => v.is_default);
      if (def) setSelectedPlate(def.plate_number);
    }).catch(() => {});
  }, []);

  const activePlate = useManual ? manualPlate.trim().toUpperCase() : selectedPlate;

  const doQueryParking = useCallback(async (plate: string) => {
    if (!plate) return;
    setQueryLoading(true);
    setQueryError('');
    setParkingInfo(null);
    setDeductPoints(0);
    setDeductSuccess(false);
    setDeductResult(null);
    try {
      const data: any = await request.get('/parking/query', { params: { plate_number: plate } });
      if (Array.isArray(data) && data.length > 0) {
        setParkingInfo(data[0]);
      } else if (data && !Array.isArray(data)) {
        setParkingInfo(data);
      } else {
        setQueryError('未查询到停车信息');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setQueryError(msg || '未查询到停车信息');
    } finally {
      setQueryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activePlate.length >= 7) {
      doQueryParking(activePlate);
    } else {
      setParkingInfo(null);
      setQueryError('');
    }
  }, [activePlate, doQueryParking]);

  const availablePoints = profile?.points ?? 0;
  const maxDeductByPoints = Math.floor(availablePoints / POINTS_RATE * 100) / 100;
  const maxDeduct = parkingInfo ? Math.min(maxDeductByPoints, parkingInfo.fee) : 0;
  const maxDeductPoints = Math.ceil(maxDeduct * POINTS_RATE);
  const deductAmount = +(deductPoints / POINTS_RATE).toFixed(2);
  const remainFee = parkingInfo ? Math.max(0, +(parkingInfo.fee - deductAmount).toFixed(2)) : 0;

  const handleDeduct = async () => {
    if (!parkingInfo || deductPoints <= 0) return;
    setDeducting(true);
    try {
      await request.post('/parking/deduct', {
        parking_order_id: parkingInfo.parking_order_id,
        points: deductPoints,
      });
      setDeductSuccess(true);
      setDeductResult({ pointsUsed: deductPoints, deductedAmount: deductAmount, remainFee });
      request.get('/member/profile').then((d: any) => setProfile(d)).catch(() => {});
    } catch (e: any) {
      alert(e?.response?.data?.message || '抵扣失败，请重试');
    } finally {
      setDeducting(false);
    }
  };

  return (
    <div className={styles.page}>
      <NavBar title="积分停车" />

      {/* 积分展示 */}
      <div className={styles.pointsBar}>
        <span className={styles.pointsLabel}>可用积分</span>
        <span className={styles.pointsValue}>{availablePoints.toLocaleString()}</span>
        <span className={styles.pointsUnit}>分</span>
      </div>

      {/* 车牌选择 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>选择车牌</div>
        <div className={styles.plateScroll}>
          {vehicles.map((v) => (
            <button
              key={v.id}
              className={`${styles.platePill} ${!useManual && selectedPlate === v.plate_number ? styles.plateActive : ''}`}
              onClick={() => { setSelectedPlate(v.plate_number); setUseManual(false); }}
            >
              {v.plate_number}
              {v.is_default && <span className={styles.pillDefault}>默认</span>}
            </button>
          ))}
          <button
            className={`${styles.platePill} ${useManual ? styles.plateActive : ''}`}
            onClick={() => setUseManual(true)}
          >
            手动输入
          </button>
        </div>

        {useManual && (
          <input
            className={styles.plateInput}
            placeholder="输入车牌号，如：粤A12345"
            value={manualPlate}
            onChange={(e) => setManualPlate(e.target.value)}
            maxLength={8}
          />
        )}
      </div>

      {/* 停车信息 */}
      {activePlate.length >= 7 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>停车信息</div>
          {queryLoading ? (
            <div className={styles.queryLoading}>
              <div className={styles.spinner} />
              <span>查询中...</span>
            </div>
          ) : queryError ? (
            <div className={styles.noParking}>{queryError}</div>
          ) : parkingInfo && !deductSuccess ? (
            <div className={styles.parkingCard}>
              <div className={styles.parkingRow}>
                <span className={styles.parkingKey}>车牌号</span>
                <span className={styles.parkingVal}>{parkingInfo.plate_number}</span>
              </div>
              <div className={styles.parkingRow}>
                <span className={styles.parkingKey}>入场时间</span>
                <span className={styles.parkingVal}>{formatTime(parkingInfo.entry_time)}</span>
              </div>
              <div className={styles.parkingRow}>
                <span className={styles.parkingKey}>停车时长</span>
                <span className={styles.parkingVal}>{formatDuration(parkingInfo.duration)}</span>
              </div>
              <div className={`${styles.parkingRow} ${styles.parkingFeeRow}`}>
                <span className={styles.parkingKey}>应付金额</span>
                <span className={styles.parkingFee}>¥{parkingInfo.fee.toFixed(2)}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* 积分抵扣 */}
      {parkingInfo && !deductSuccess && !queryLoading && !queryError && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>积分抵扣</div>
          <div className={styles.deductCard}>
            <div className={styles.deductInfo}>
              <span className={styles.deductHint}>100积分 = 1元，最多可抵扣</span>
              <span className={styles.deductMax}>¥{maxDeduct.toFixed(2)}</span>
            </div>

            <div className={styles.sliderWrap}>
              <input
                type="range"
                className={styles.slider}
                min={0}
                max={maxDeductPoints}
                step={100}
                value={deductPoints}
                onChange={(e) => setDeductPoints(Number(e.target.value))}
              />
              <div className={styles.sliderLabels}>
                <span>0</span>
                <span>{maxDeductPoints}分</span>
              </div>
            </div>

            <div className={styles.deductCalc}>
              <div className={styles.calcRow}>
                <span className={styles.calcKey}>使用积分</span>
                <span className={styles.calcVal} style={{ color: 'var(--gold)' }}>{deductPoints}分</span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcKey}>抵扣金额</span>
                <span className={styles.calcVal} style={{ color: 'var(--gold)' }}>-¥{deductAmount.toFixed(2)}</span>
              </div>
              <div className={`${styles.calcRow} ${styles.calcTotal}`}>
                <span className={styles.calcKey}>还需支付</span>
                <span className={styles.calcVal} style={{ color: 'var(--primary)', fontSize: '20px' }}>¥{remainFee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            className={styles.deductBtn}
            onClick={handleDeduct}
            disabled={deductPoints <= 0 || deducting}
          >
            {deducting ? '处理中...' : `确认抵扣 ${deductPoints}积分`}
          </button>
        </div>
      )}

      {/* 抵扣成功 */}
      {deductSuccess && deductResult && (
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="var(--success)" />
              <path d="M7 12l3.5 3.5L17 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.successTitle}>抵扣成功</div>
          <div className={styles.successRows}>
            <div className={styles.successRow}>
              <span>使用积分</span>
              <span style={{ color: 'var(--gold)' }}>{deductResult.pointsUsed}分</span>
            </div>
            <div className={styles.successRow}>
              <span>抵扣金额</span>
              <span style={{ color: 'var(--gold)' }}>¥{deductResult.deductedAmount.toFixed(2)}</span>
            </div>
            <div className={styles.successRow}>
              <span>剩余应付</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>¥{deductResult.remainFee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 停车记录入口 */}
      <div className={styles.recordsLink} onClick={() => navigate('/parking-records')}>
        查看停车记录 ›
      </div>
    </div>
  );
}
