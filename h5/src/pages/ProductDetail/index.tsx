import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import styles from './style.module.scss';
import type { Product } from '../../types';
import { getProduct } from '../../services/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      getProduct(Number(id)).then((data: any) => setProduct(data)).catch(() => {});
    }
  }, [id]);

  if (!product) {
    return (
      <div className={styles.page}>
        <NavBar title="商品详情" />
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <NavBar title="商品详情" />
      <div className={styles.imgArea}>
        <span>商品图</span>
      </div>
      <div className={styles.body}>
        <div className={styles.priceCard}>
          <div className={styles.priceRow}>
            <span className={styles.price}>¥{product.price}</span>
            {product.original_price && <span className={styles.originalPrice}>¥{product.original_price}</span>}
            {product.is_hot && <span className={styles.hotTag}>热销</span>}
          </div>
          <div className={styles.productName}>{product.name}</div>
          <div className={styles.salesInfo}></div>
        </div>

        <div
          className={styles.merchantCard}
          onClick={() => product.merchant_id && navigate(`/merchant/${product.merchant_id}`)}
        >
          <div className={styles.merchantLeft}>
            <div className={styles.merchantIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div className={styles.merchantName}>{product.merchant?.name}</div>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        {product.description && (
          <div className={styles.descCard}>
            <div className={styles.descTitle}>商品介绍</div>
            <div className={styles.descText}>{product.description}</div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.buyBtn}>立即购买</button>
      </div>
    </div>
  );
}
