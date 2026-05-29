import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import styles from './style.module.scss';
import type { Merchant, Product } from '../../types';
import { getMerchant, getProducts } from '../../services/api';

export default function MerchantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id && id !== 'all') {
      getMerchant(Number(id)).then((data: any) => setMerchant(data)).catch(() => {});
      getProducts({ merchant_id: Number(id) }).then((data: any) => {
        setProducts(Array.isArray(data) ? data : (data?.list ?? []));
      }).catch(() => {});
    }
  }, [id]);

  if (!merchant) {
    return (
      <div className={styles.page}>
        <NavBar title="商户详情" />
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <NavBar title="商户详情" />
      <div className={styles.header}>
        <div className={styles.logo}>{merchant.name[0]}</div>
        <div className={styles.info}>
          <div className={styles.name}>{merchant.name}</div>
          <div className={styles.meta}>{merchant.category} · {merchant.floor}</div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.row}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className={styles.rowLabel}>位置</span>
            <span className={styles.rowValue}>{merchant.location ?? merchant.floor}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.row}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
            </svg>
            <span className={styles.rowLabel}>电话</span>
            <span className={styles.rowValue}>{merchant.phone ?? '暂无'}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.row}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className={styles.rowLabel}>营业时间</span>
            <span className={styles.rowValue}>{merchant.business_hours ?? '暂无'}</span>
          </div>
        </div>

        {merchant.description && (
          <div className={styles.card}>
            <div className={styles.sectionTitle}>商户简介</div>
            <div className={styles.desc}>{merchant.description}</div>
          </div>
        )}

        <div className={styles.sectionTitle2}>在售商品</div>
        <div className={styles.productList}>
          {products.map((p) => (
            <div key={p.id} className={styles.productItem} onClick={() => navigate(`/product/${p.id}`)}>
              <div className={styles.productImg}><span>图</span></div>
              <div className={styles.productInfo}>
                <div className={styles.productName}>{p.name}</div>
                <div className={styles.productPrice}>¥{p.price}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          ))}
          {products.length === 0 && <div className={styles.empty}>暂无商品</div>}
        </div>
      </div>
    </div>
  );
}
