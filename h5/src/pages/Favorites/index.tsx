import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import request from '../../services/api';
import styles from './style.module.scss';

interface FavoriteItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    price: number;
    original_price: number;
    merchant: {
      name: string;
      floor: string;
    };
  };
  created_at: string;
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request.get('/member/favorites')
      .then((data: any) => {
        setFavorites(data.list || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <NavBar title="我的收藏" />
      {loading ? (
        <div className={styles.empty}>加载中...</div>
      ) : favorites.length === 0 ? (
        <div className={styles.empty}>暂无收藏</div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((item) => (
            <div key={item.id} className={styles.card} onClick={() => navigate(`/product/${item.product_id}`)}>
              <div className={styles.img}><span>商品图</span></div>
              <div className={styles.info}>
                <div className={styles.name}>{item.product.name}</div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>¥{item.product.price}</span>
                  <span className={styles.originalPrice}>¥{item.product.original_price}</span>
                </div>
                <div className={styles.meta}>{item.product.merchant.name} · {item.product.merchant.floor}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
