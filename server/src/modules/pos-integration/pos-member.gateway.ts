import { Injectable } from '@nestjs/common';
import { ByPosClientService } from './bypos-client.service';
import { ByPosMember, PosMemberProfile, PosPagedResult } from './types';

interface ByPosResponse<T> {
  code?: number;
  msg?: string;
  data?: T;
}

@Injectable()
export class PosMemberGateway {
  constructor(private byposClient: ByPosClientService) {}

  async findMember(query: { phone?: string; posMemberId?: string; memberNo?: string }): Promise<PosMemberProfile | null> {
    const keyword = query.phone || query.memberNo || query.posMemberId || '';
    if (!keyword) return null;

    const result = await this.getMembers({ keyword, page: 1, pageSize: 20 });
    const member = result.list.find((item) => {
      const posId = this.stringify(item.vipid || item.id);
      return (
        (query.phone && item.mobile === query.phone) ||
        (query.memberNo && item.vipno === query.memberNo) ||
        (query.posMemberId && posId === query.posMemberId)
      );
    });

    return member ? this.mapMember(member) : null;
  }

  async getMembers(options: { keyword?: string; page?: number; pageSize?: number }): Promise<PosPagedResult<ByPosMember>> {
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const response = await this.byposClient.post<ByPosResponse<any>>('/prod-api/ZmSvr/zmVip/getVipList', {
      name: '',
      status: '',
      codenamemobile: options.keyword || '',
      typeid: '',
      page,
      quick: 1,
      share_vip: 1,
      vipteloutencrypt: 0,
      field: 'issuesid,typeid,vipno',
      type: 'asc,asc,asc',
      pagesize: pageSize,
    });

    const data = response.data || {};
    return {
      list: data.list || [],
      total: Number(data.total || 0),
      page,
      pageSize,
      pages: data.pages ? Number(data.pages) : undefined,
    };
  }

  async getPointLogs(options: { keyword: string; page?: number; pageSize?: number }) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const response = await this.byposClient.post<ByPosResponse<any>>('/prod-api/ZmSvr/vipPoint/getVipPointDetailList', {
      vipno: '',
      cond: options.keyword,
      field: 'createtime,sid',
      type: 'desc,asc',
      page,
      quick: 1,
      pagesize: pageSize,
    });

    const data = response.data || {};
    const list = (data.list || []).map((item: any, index: number) => this.mapPointLog(item, page, pageSize, index));
    return { list, total: Number(data.total || list.length), page, pageSize, data_freshness: 'realtime' as const };
  }

  async getConsumptionRecords(options: { keyword: string; page?: number; pageSize?: number }) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const response = await this.byposClient.post<ByPosResponse<any>>('/prod-api/ZmSvr/vipSale/getVipSaleTotalList', {
      vipno: '',
      cond: options.keyword,
      field: 'billdate,sid',
      type: 'desc,asc',
      page,
      quick: 1,
      pagesize: pageSize,
    });

    const data = response.data || {};
    const list = (data.list || []).map((item: any, index: number) => this.mapConsumptionRecord(item, page, pageSize, index));
    return { list, total: Number(data.total || list.length), page, pageSize, data_freshness: 'realtime' as const };
  }

  mapMember(member: ByPosMember): PosMemberProfile {
    const posMemberId = this.stringify(member.vipid || member.id);
    const memberNo = this.stringify(member.vipno || posMemberId);
    const phone = this.stringify(member.mobile);
    return {
      pos_member_id: posMemberId,
      pos_vip_no: memberNo,
      phone,
      nickname: this.stringify(member.vipname) || '华联会员',
      total_points: Math.floor(this.toNumber(member.nowpoint)),
      total_consumed: this.toNumber(member.allsalemoney),
      year_consumed: this.toNumber(member.allsalemoney),
      balance: this.toNumber(member.nowmoney),
      raw: member,
    };
  }

  private stringify(value: unknown) {
    return value === undefined || value === null ? '' : String(value);
  }

  private toNumber(value: unknown) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  private mapPointLog(item: any, page: number, pageSize: number, index: number) {
    const points = this.firstNumber(item, ['point', 'points', 'currpoint', 'changepoint', 'addpoint', 'pointnum', 'integral', 'jf', 'score']);
    const balance = this.firstNumber(item, ['nowpoint', 'lastpoint', 'balance', 'surpluspoint', 'remainpoint']);
    const createdAt = this.firstString(item, ['createtime', 'createdate', 'billdate', 'operdate', 'time']) || new Date().toISOString();
    const billNo = this.firstString(item, ['billno', 'billid', 'orderno', 'saleno']);
    const businessType = this.firstString(item, ['businesstype', 'typename', 'billtype', 'opertype', 'iotypename']);
    return {
      id: this.firstString(item, ['id', 'billid', 'billno']) || `${page}-${index}`,
      memberId: undefined,
      type: points < 0 ? 'consume' : 'earn',
      points,
      balance,
      balance_after: balance,
      description: businessType || (billNo ? `POS积分变动 ${billNo}` : 'POS积分变动'),
      createdAt,
      created_at: createdAt,
      ref_id: billNo,
      source: 'pos',
      raw: item,
    };
  }

  private mapConsumptionRecord(item: any, page: number, pageSize: number, index: number) {
    const amount = this.firstNumber(item, ['saleamt', 'salemoney', 'amount', 'money', 'billamt', 'realamt', 'ysamt']);
    const points = this.firstNumber(item, ['point', 'points', 'addpoint', 'integral', 'jf']);
    const consumedAt = this.firstString(item, ['billdate', 'saledate', 'createtime', 'createdate', 'time']) || new Date().toISOString();
    const billNo = this.firstString(item, ['billno', 'billid', 'orderno', 'saleno']) || `${page}-${index}`;
    const storeName = this.firstString(item, ['sidname', 'sname', 'storename', 'shopname', 'store_name']) || 'POS门店';
    return {
      id: this.firstString(item, ['id', 'billid', 'billno']) || `${page}-${index}`,
      pos_order_id: billNo,
      amount,
      store_name: storeName,
      points_earned: points,
      consumed_at: consumedAt,
      synced_at: new Date().toISOString(),
      source: 'pos',
      raw: item,
    };
  }

  private firstString(item: any, keys: string[]) {
    for (const key of keys) {
      const value = item?.[key];
      if (value !== undefined && value !== null && String(value) !== '') return String(value);
    }
    return '';
  }

  private firstNumber(item: any, keys: string[]) {
    for (const key of keys) {
      const value = item?.[key];
      if (value !== undefined && value !== null && value !== '') return this.toNumber(value);
    }
    return 0;
  }
}
