import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.scss';
import { login } from '../../services/api';
import { useUserStore } from '../../stores/userStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: storeLogin } = useUserStore();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (!code) {
      setError('请输入验证码');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data: any = await login(phone, code);
      if (data?.token && data?.member) {
        storeLogin(data.token, data.member);
      } else if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      navigate('/', { replace: true });
    } catch {
      setError('登录失败，请检查验证码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.logoArea}>
        <div className={styles.logo}>华联</div>
        <div className={styles.logoSub}>华联商城会员中心</div>
      </div>

      <div className={styles.form}>
        <div className={styles.inputWrap}>
          <input
            className={styles.input}
            type="tel"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
          />
        </div>
        <div className={styles.inputWrap}>
          <input
            className={styles.input}
            type="text"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
          <span className={styles.codeHint}>测试码: 1234</span>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button
          className={styles.loginBtn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '登录中...' : '登录 / 注册'}
        </button>
        <div className={styles.hint}>未注册手机号将自动创建账号</div>
      </div>
    </div>
  );
}
