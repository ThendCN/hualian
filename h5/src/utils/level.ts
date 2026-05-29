const levelMap: Record<string, string> = {
  normal: '普通会员',
  silver: '银卡会员',
  gold: '金卡会员',
  diamond: '钻石会员',
};

export const getLevelName = (level: string) => levelMap[level] || '普通会员';

export const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    normal: '#999',
    silver: '#A0A0A0',
    gold: '#C5963A',
    diamond: '#E85C3A',
  };
  return colors[level] || '#999';
};
