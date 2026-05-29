export interface ByPosConfig {
  baseUrl: string;
  account: string;
  operator: string;
  password: string;
  sid: number;
  spid: number;
  client: string;
  timeoutMs: number;
}

export interface ByPosMember {
  id?: number;
  vipid?: string;
  vipno?: string;
  vipname?: string;
  mobile?: string;
  nowpoint?: number | string;
  allsalemoney?: number | string;
  nowmoney?: number | string;
  alladdmoney?: number | string;
  typeid?: string;
  status?: number | string;
  cardstatus?: number | string;
  createtime?: string;
  lastsaledate?: string;
}

export interface PosMemberProfile {
  pos_member_id: string;
  pos_vip_no: string;
  phone: string;
  nickname: string;
  total_points: number;
  total_consumed: number;
  year_consumed: number;
  balance: number;
  raw: ByPosMember;
}

export interface PosPagedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  pages?: number;
}
