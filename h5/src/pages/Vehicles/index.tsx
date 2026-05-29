import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import request from '../../services/api';
import styles from './style.module.scss';

interface Vehicle {
  id: number;
  plate_number: string;
  plate_color: string;
  is_default: boolean;
}

const COLOR_LABELS: Record<string, string> = {
  blue: '蓝牌',
  green: '绿牌',
  yellow: '黄牌',
  white: '白牌',
};

const COLOR_STYLES: Record<string, { bg: string; color: string }> = {
  blue: { bg: '#1565C0', color: '#fff' },
  green: { bg: '#2E7D32', color: '#fff' },
  yellow: { bg: '#F9A825', color: '#1A1A1A' },
  white: { bg: '#E0E0E0', color: '#1A1A1A' },
};

function validatePlate(plate: string): boolean {
  return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁夏][A-Z][A-Z0-9]{4,5}$/.test(plate);
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [plateInput, setPlateInput] = useState('');
  const [colorInput, setColorInput] = useState<'blue' | 'green' | 'yellow' | 'white'>('blue');
  const [adding, setAdding] = useState(false);
  const [plateError, setPlateError] = useState('');

  const fetchVehicles = async () => {
    try {
      const data = await request.get('/vehicles');
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleAdd = async () => {
    const plate = plateInput.trim().toUpperCase();
    if (!validatePlate(plate)) {
      setPlateError('请输入正确的车牌号');
      return;
    }
    setAdding(true);
    try {
      await request.post('/vehicles', { plate_number: plate, plate_color: colorInput });
      setShowAdd(false);
      setPlateInput('');
      setColorInput('blue');
      setPlateError('');
      fetchVehicles();
    } catch (e: any) {
      setPlateError(e?.response?.data?.message || '添加失败');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该车牌？')) return;
    try {
      await request.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch {}
  };

  const handleSetDefault = async (id: number) => {
    try {
      await request.put(`/vehicles/${id}/default`);
      fetchVehicles();
    } catch {}
  };

  return (
    <div className={styles.page}>
      <NavBar title="我的车辆" />

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : vehicles.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="1.5">
                <path d="M19 17H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h6l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2z" />
                <circle cx="7.5" cy="14.5" r="1.5" />
                <circle cx="16.5" cy="14.5" r="1.5" />
              </svg>
            </div>
            <p className={styles.emptyText}>暂无绑定车牌</p>
            <p className={styles.emptyHint}>添加车牌后可享受积分停车优惠</p>
          </div>
        ) : (
          <div className={styles.list}>
            {vehicles.map((v) => (
              <div key={v.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <span className={styles.plateNum}>{v.plate_number}</span>
                  <div className={styles.tags}>
                    <span
                      className={styles.colorTag}
                      style={{ background: COLOR_STYLES[v.plate_color]?.bg, color: COLOR_STYLES[v.plate_color]?.color }}
                    >
                      {COLOR_LABELS[v.plate_color] || v.plate_color}
                    </span>
                    {v.is_default && <span className={styles.defaultTag}>默认</span>}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  {!v.is_default && (
                    <button className={styles.btnDefault} onClick={() => handleSetDefault(v.id)}>
                      设为默认
                    </button>
                  )}
                  <button className={styles.btnDelete} onClick={() => handleDelete(v.id)}>
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          + 添加车辆
        </button>
      </div>

      {showAdd && (
        <div className={styles.overlay} onClick={() => setShowAdd(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <h3 className={styles.sheetTitle}>添加车牌</h3>

            <div className={styles.field}>
              <label className={styles.label}>车牌号码</label>
              <input
                className={styles.input}
                placeholder="例：粤A12345"
                value={plateInput}
                onChange={(e) => { setPlateInput(e.target.value); setPlateError(''); }}
                maxLength={8}
              />
              {plateError && <span className={styles.error}>{plateError}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>车牌颜色</label>
              <div className={styles.colorOptions}>
                {(['blue', 'green', 'yellow', 'white'] as const).map((c) => (
                  <button
                    key={c}
                    className={`${styles.colorOption} ${colorInput === c ? styles.colorSelected : ''}`}
                    style={{ background: COLOR_STYLES[c].bg, color: COLOR_STYLES[c].color }}
                    onClick={() => setColorInput(c)}
                  >
                    {COLOR_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>

            <button className={styles.confirmBtn} onClick={handleAdd} disabled={adding}>
              {adding ? '添加中...' : '确认添加'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
