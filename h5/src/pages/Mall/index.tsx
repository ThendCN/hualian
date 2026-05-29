import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.scss';
import type { Product, ProductCategory } from '../../types';
import { getCategories, getProducts } from '../../services/api';

export default function MallPage() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState(0);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getCategories().then((data: any) => {
      setCategories(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const params: any = {};
    if (activeCat > 0 && categories[activeCat - 1]) {
      params.category_id = categories[activeCat - 1].id;
    }
    if (search) params.keyword = search;
    getProducts(params).then((data: any) => {
      setProducts(Array.isArray(data) ? data : (data?.list ?? []));
    }).catch(() => {});
  }, [activeCat, search, categories]);

  const catLabels = ['全部', ...categories.map((c) => c.name)];

  return (
    <div className={styles.page}>
      {/* 搜索栏 */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="搜索商品、商户"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 分类导航 */}
      <div className={styles.catScroll}>
        {catLabels.map((c, i) => (
          <div
            key={c}
            className={`${styles.catPill} ${activeCat === i ? styles.catActive : ''}`}
            onClick={() => setActiveCat(i)}
          >
            {c}
          </div>
        ))}
      </div>

      {/* 商户入口 */}
      <div className={styles.merchantEntry} onClick={() => navigate('/merchant/all')}>
        <div className={styles.merchantEntryLeft}>
          <div className={styles.merchantIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className={styles.merchantEntryTitle}>商户店铺</div>
            <div className={styles.merchantEntrySub}>浏览全部入驻商户</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* 商品瀑布流 */}
      <div className={styles.grid}>
        {products.map((p) => (
          <div key={p.id} className={styles.productCard} onClick={() => navigate(`/product/${p.id}`)}>
            <div className={styles.productImg}>
              <span>商品图</span>
              {p.is_hot && <span className={styles.hotBadge}>热销</span>}
            </div>
            <div className={styles.productInfo}>
              <div className={styles.productName}>{p.name}</div>
              <div className={styles.priceRow}>
                <span className={styles.price}>¥{p.price}</span>
                {p.original_price && <span className={styles.originalPrice}>¥{p.original_price}</span>}
              </div>
              <div className={styles.productMeta}>
                <span>{p.merchant?.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className={styles.empty}>暂无相关商品</div>
      )}
    </div>
  );
}
