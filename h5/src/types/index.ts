export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface Member {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string | null;
  member_no: string;
  level: string;
  total_points: number;
  total_consumed: number;
  year_consumed: number;
  source?: string;
  pos_member_id?: string | null;
  pos_vip_no?: string | null;
  data_freshness?: 'realtime' | 'cached';
  last_synced_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MemberVehicle {
  id: number;
  memberId: number;
  plateNumber: string;
  brand?: string;
  model?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PointsLog {
  id: number;
  memberId: number;
  type: 'earn' | 'consume' | 'spend' | 'expire' | 'adjust';
  points: number;
  balance: number;
  description: string;
  createdAt: string;
  created_at?: string;
}

export interface ConsumptionRecord {
  id: number;
  memberId: number;
  merchantId: number;
  merchantName: string;
  amount: number;
  pointsEarned: number;
  createdAt: string;
}

export interface ParkingRecord {
  id: number;
  memberId: number;
  plateNumber: string;
  entryTime: string;
  exitTime?: string;
  duration?: number;
  fee: number;
  pointsUsed: number;
  status: 'parking' | 'completed';
}

export interface Merchant {
  id: number;
  name: string;
  logo?: string | null;
  description?: string;
  floor: string;
  location?: string;
  business_hours?: string;
  phone?: string | null;
  category: string;
  sort_order?: number;
  status?: string;
  created_at?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  icon?: string;
  parent_id?: number | null;
  sort_order?: number;
}

export interface Product {
  id: number;
  merchant_id: number;
  merchant?: Merchant;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  images: string[];
  is_hot?: boolean;
  is_new?: boolean;
  sort_order?: number;
  status?: string;
  created_at?: string;
}

export interface Activity {
  id: number;
  title: string;
  cover_image?: string | null;
  content?: string;
  type: 'promotion' | 'discount' | 'points' | 'event' | 'coupon';
  start_time: string;
  end_time: string;
  status: 'active' | 'ended' | 'draft';
  require_signup?: boolean;
  created_at?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'notice' | 'activity' | 'system';
  is_top?: boolean;
  status?: string;
  publish_at?: string;
  created_at?: string;
}

export interface CouponTemplate {
  id: number;
  name: string;
  type: 'discount' | 'cash' | 'free';
  value: number;
  minAmount?: number;
  validDays: number;
  description?: string;
  merchantId?: number;
  merchantName?: string;
}

export interface MemberCoupon {
  id: number;
  memberId: number;
  templateId: number;
  name: string;
  type: 'discount' | 'cash' | 'free';
  value: number;
  minAmount?: number;
  status: 'unused' | 'used' | 'expired';
  expireAt: string;
  usedAt?: string;
}

export interface SystemConfig {
  key: string;
  value: string;
  description?: string;
}
