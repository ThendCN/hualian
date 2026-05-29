import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ByPosConfig } from './types';

@Injectable()
export class ByPosClientService {
  private readonly logger = new Logger(ByPosClientService.name);
  private readonly config: ByPosConfig;
  private cookie = '';
  private sysparam = '';
  private loginAt = 0;

  constructor(private configService: ConfigService) {
    this.config = {
      baseUrl: this.configService.get<string>('BYPOS_BASE_URL') || 'https://yun.bypos.net',
      account: this.configService.get<string>('BYPOS_ACCOUNT') || '',
      operator: this.configService.get<string>('BYPOS_OPERATOR') || '',
      password: this.configService.get<string>('BYPOS_PASSWORD') || '',
      sid: Number(this.configService.get<string>('BYPOS_SID') || 0),
      spid: Number(this.configService.get<string>('BYPOS_SPID') || 0),
      client: this.configService.get<string>('BYPOS_CLIENT') || 'HT',
      timeoutMs: Number(this.configService.get<string>('BYPOS_REQUEST_TIMEOUT_MS') || 10000),
    };
  }

  isConfigured() {
    return Boolean(this.config.account && this.config.operator && this.config.password && this.config.sid && this.config.spid);
  }

  async post<T>(path: string, params: Record<string, string | number | undefined | null>): Promise<T> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('BYPOS 未配置');
    }

    await this.ensureSession();
    const body = new URLSearchParams(this.withCommonParams(params));
    const response = await this.fetchWithTimeout(`${this.config.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: this.cookie,
      },
      body,
    });

    if (response.status === 401 || response.status === 403) {
      this.clearSession();
      await this.ensureSession(true);
      return this.post<T>(path, params);
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(`BYPOS 请求失败: ${response.status}`);
    }

    return this.parseJson<T>(response);
  }

  private withCommonParams(params: Record<string, string | number | undefined | null>) {
    const merged: Record<string, string> = {
      sid: String(this.config.sid),
      spid: String(this.config.spid),
      client: this.config.client,
      sysparam: this.sysparam,
      random: String(Math.random()),
      newzmversion: '20240428',
    };

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        merged[key] = String(value);
      }
    }

    return merged;
  }

  private async ensureSession(force = false) {
    const sessionIsFresh = this.cookie && this.sysparam && Date.now() - this.loginAt < 50 * 60 * 1000;
    if (!force && sessionIsFresh) return;

    const response = await this.fetchWithTimeout(`${this.config.baseUrl}/prod-api/ZmSvr/zmlogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        account: this.config.account,
        mobile: this.config.operator,
        pwd: this.config.password,
        client: this.config.client,
        random: String(Math.random()),
        newzmversion: '20240428',
      }),
    });
    const cookie = this.extractCookies(response.headers);
    if (cookie) this.cookie = cookie;

    if (!response.ok) {
      this.logger.warn(`BYPOS 登录失败, status=${response.status}`);
      throw new ServiceUnavailableException('BYPOS 登录失败');
    }

    const loginResult = await this.parseJson<any>(response);
    const data = loginResult?.data;
    if (data) {
      this.sysparam = JSON.stringify({
        sid: this.config.sid,
        spid: this.config.spid,
        userStoreBsid: data.userStoreBsid || this.config.sid,
        roleid: data.user?.roleid || this.config.operator,
        opername: data.user?.name || data.store?.opername || '',
        userRole: data.user?.roleid || this.config.operator,
        mainimage: data.store?.imgurl || '',
        softoem: data.store?.softoem || 0,
        operid: data.user?.userid || data.store?.operid || '',
        client: this.config.client,
        machserial: '',
      });
    }

    if (!this.cookie || !this.sysparam) {
      this.logger.warn(`BYPOS 登录未拿到完整会话, status=${response.status}`);
      throw new ServiceUnavailableException('BYPOS 登录失败');
    }

    this.loginAt = Date.now();
  }

  private clearSession() {
    this.cookie = '';
    this.sysparam = '';
    this.loginAt = 0;
  }

  private extractCookies(headers: Headers) {
    const getSetCookie = (headers as any).getSetCookie?.bind(headers);
    const rawCookies: string[] = getSetCookie ? getSetCookie() : [];
    const single = headers.get('set-cookie');
    if (single && rawCookies.length === 0) rawCookies.push(single);

    return rawCookies
      .map((cookie) => cookie.split(';')[0])
      .filter(Boolean)
      .join('; ');
  }

  private async parseJson<T>(response: Response): Promise<T> {
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ServiceUnavailableException('BYPOS 返回格式异常');
    }
  }

  private async fetchWithTimeout(url: string, init: RequestInit) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
      this.logger.warn(`BYPOS 网络请求异常: ${error instanceof Error ? error.message : String(error)}`);
      throw new ServiceUnavailableException('BYPOS 暂不可用');
    } finally {
      clearTimeout(timer);
    }
  }
}
