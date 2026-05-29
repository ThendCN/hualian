import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig, ConfigCategory } from '../../entities/system-config.entity';
import { Member, MemberLevel, MemberSource } from '../../entities/member.entity';
import { MemberVehicle } from '../../entities/member-vehicle.entity';
import { Merchant } from '../../entities/merchant.entity';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';
import { Activity, ActivityType, ActivityStatus } from '../../entities/activity.entity';
import { Announcement, AnnouncementType, AnnouncementStatus } from '../../entities/announcement.entity';
import { CouponTemplate, CouponType, CouponTemplateStatus } from '../../entities/coupon-template.entity';
import { PointsLog, PointsLogType, PointsLogSource } from '../../entities/points-log.entity';
import { ConsumptionRecord } from '../../entities/consumption-record.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
    @InjectRepository(MemberVehicle)
    private vehicleRepo: Repository<MemberVehicle>,
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoryRepo: Repository<ProductCategory>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Announcement)
    private announcementRepo: Repository<Announcement>,
    @InjectRepository(CouponTemplate)
    private couponTemplateRepo: Repository<CouponTemplate>,
    @InjectRepository(PointsLog)
    private pointsLogRepo: Repository<PointsLog>,
    @InjectRepository(ConsumptionRecord)
    private consumptionRepo: Repository<ConsumptionRecord>,
  ) {}

  async onModuleInit() {
    const count = await this.configRepo.count();
    if (count === 0) {
      await this.seedConfigs();
      await this.seedMembers();
      await this.seedMerchants();
      await this.seedCategories();
      await this.seedProducts();
      await this.seedActivities();
      await this.seedAnnouncements();
      await this.seedCouponTemplates();
      await this.seedPointsAndConsumption();
      await this.seedVehicles();
      console.log('种子数据初始化完成');
    }
  }

  private async seedConfigs() {
    const configs = [
      { key: 'points.earn_ratio', value: '1', desc: '消费1元获得积分数', cat: ConfigCategory.POINTS },
      { key: 'points.exchange_ratio', value: '100', desc: '100积分抵扣1元', cat: ConfigCategory.POINTS },
      { key: 'points.checkin_daily', value: '5', desc: '每日签到积分', cat: ConfigCategory.POINTS },
      { key: 'points.checkin_streak_7', value: '50', desc: '连续签到7天奖励', cat: ConfigCategory.POINTS },
      { key: 'points.referral', value: '100', desc: '推荐新会员奖励积分', cat: ConfigCategory.POINTS },
      { key: 'parking.free_threshold', value: '200', desc: '消费满200元免停车费', cat: ConfigCategory.PARKING },
      { key: 'parking.free_max_hours', value: '24', desc: '消费免停最长小时数', cat: ConfigCategory.PARKING },
      { key: 'parking.silver_free_hours', value: '1', desc: '银卡会员免费停车小时', cat: ConfigCategory.PARKING },
      { key: 'parking.gold_free_hours', value: '2', desc: '金卡会员免费停车小时', cat: ConfigCategory.PARKING },
      { key: 'parking.diamond_free_hours', value: '-1', desc: '钻石会员免费停车（-1=无限）', cat: ConfigCategory.PARKING },
      { key: 'member.silver_threshold', value: '2000', desc: '升级银卡年消费门槛', cat: ConfigCategory.MEMBER },
      { key: 'member.gold_threshold', value: '5000', desc: '升级金卡年消费门槛', cat: ConfigCategory.MEMBER },
      { key: 'member.diamond_threshold', value: '10000', desc: '升级钻石卡年消费门槛', cat: ConfigCategory.MEMBER },
    ];

    for (const c of configs) {
      await this.configRepo.save(
        this.configRepo.create({ config_key: c.key, config_value: c.value, description: c.desc, category: c.cat }),
      );
    }
  }

  private async seedMembers() {
    const members = [
      { phone: '13800138001', nickname: '张小明', member_no: 'HL00000001', level: MemberLevel.DIAMOND, total_points: 5280, total_consumed: 15800, year_consumed: 12000 },
      { phone: '13800138002', nickname: '李小红', member_no: 'HL00000002', level: MemberLevel.GOLD, total_points: 1860, total_consumed: 6500, year_consumed: 5200 },
      { phone: '13800138003', nickname: '王小芳', member_no: 'HL00000003', level: MemberLevel.SILVER, total_points: 320, total_consumed: 2800, year_consumed: 2100 },
    ];

    for (const m of members) {
      await this.memberRepo.save(
        this.memberRepo.create({ ...m, source: MemberSource.MINIAPP }),
      );
    }
  }

  private async seedMerchants() {
    const merchants = [
      { name: '优衣库', floor: 'B1', location: 'B1-01', category: '服装', business_hours: '10:00-22:00', description: '全球知名快时尚品牌，提供高品质基础款服装' },
      { name: '星巴克咖啡', floor: '1F', location: '1F-05', category: '餐饮', business_hours: '08:00-22:00', description: '全球最大的咖啡连锁品牌' },
      { name: '苹果专卖店', floor: '1F', location: '1F-12', category: '数码', business_hours: '10:00-22:00', description: 'Apple官方授权零售店' },
      { name: '海底捞火锅', floor: '4F', location: '4F-01', category: '餐饮', business_hours: '11:00-02:00', description: '知名火锅连锁品牌，以服务著称' },
      { name: '屈臣氏', floor: '2F', location: '2F-08', category: '美妆', business_hours: '10:00-22:00', description: '亚洲最大的保健及美容产品零售商' },
      { name: '无印良品', floor: '3F', location: '3F-03', category: '生活', business_hours: '10:00-22:00', description: '日本简约生活方式品牌' },
      { name: '耐克运动', floor: 'B1', location: 'B1-15', category: '运动', business_hours: '10:00-22:00', description: 'Nike全球知名运动品牌旗舰店' },
      { name: '万达影城', floor: '5F', location: '5F-全层', category: '娱乐', business_hours: '09:00-24:00', description: '全国连锁影院，提供最新院线电影' },
    ];

    for (let i = 0; i < merchants.length; i++) {
      await this.merchantRepo.save(
        this.merchantRepo.create({ ...merchants[i], sort_order: i }),
      );
    }
  }

  private async seedCategories() {
    const categories = [
      { name: '服装服饰', icon: 'clothes', sort_order: 0 },
      { name: '餐饮美食', icon: 'food', sort_order: 1 },
      { name: '数码电器', icon: 'digital', sort_order: 2 },
      { name: '美妆护肤', icon: 'beauty', sort_order: 3 },
      { name: '运动户外', icon: 'sport', sort_order: 4 },
    ];

    for (const c of categories) {
      await this.categoryRepo.save(this.categoryRepo.create(c));
    }
  }

  private async seedProducts() {
    const products = [
      { merchant_id: 1, name: '男款修身牛仔裤', price: 299, original_price: 399, category_id: 1, is_hot: true, description: '经典修身版型，舒适弹力面料' },
      { merchant_id: 1, name: '女款宽松卫衣', price: 199, original_price: 259, category_id: 1, is_new: true, description: '柔软舒适，百搭款式' },
      { merchant_id: 1, name: '男款商务衬衫', price: 179, original_price: 229, category_id: 1, description: '免烫面料，商务休闲两用' },
      { merchant_id: 2, name: '拿铁咖啡（大杯）', price: 38, category_id: 2, is_hot: true, description: '精选阿拉比卡咖啡豆，香醇浓郁' },
      { merchant_id: 2, name: '抹茶星冰乐', price: 42, category_id: 2, is_new: true, description: '日本宇治抹茶，清新甜蜜' },
      { merchant_id: 3, name: 'iPhone 15 Pro', price: 7999, original_price: 8999, category_id: 3, is_hot: true, description: '钛金属设计，A17 Pro芯片' },
      { merchant_id: 3, name: 'AirPods Pro 2', price: 1799, original_price: 1999, category_id: 3, description: '主动降噪，空间音频' },
      { merchant_id: 3, name: 'Apple Watch Series 9', price: 2999, original_price: 3299, category_id: 3, is_new: true, description: '健康监测，智能手表' },
      { merchant_id: 4, name: '牛肉火锅套餐（2人）', price: 298, category_id: 2, is_hot: true, description: '精选牛肉，配菜丰富' },
      { merchant_id: 4, name: '海鲜拼盘', price: 188, category_id: 2, description: '新鲜海鲜，现捞现烫' },
      { merchant_id: 5, name: '兰蔻小黑瓶精华', price: 680, original_price: 780, category_id: 4, is_hot: true, description: '经典抗老精华，肌肤焕活' },
      { merchant_id: 5, name: '雅诗兰黛粉底液', price: 420, category_id: 4, description: '持久遮瑕，自然妆感' },
      { merchant_id: 6, name: '原木收纳盒套装', price: 128, original_price: 168, category_id: 5, is_new: true, description: '天然原木，简约设计' },
      { merchant_id: 6, name: '棉麻床品四件套', price: 399, original_price: 499, category_id: 1, description: '纯棉材质，亲肤透气' },
      { merchant_id: 7, name: 'Nike Air Max 270', price: 899, original_price: 1099, category_id: 5, is_hot: true, description: '气垫缓震，时尚运动鞋' },
      { merchant_id: 7, name: 'Nike运动套装', price: 499, original_price: 699, category_id: 5, description: '速干面料，运动必备' },
      { merchant_id: 7, name: 'Nike训练背包', price: 299, original_price: 399, category_id: 5, is_new: true, description: '大容量，多功能收纳' },
      { merchant_id: 8, name: '电影票（普通厅）', price: 45, category_id: 5, description: '最新院线电影，舒适观影体验' },
      { merchant_id: 8, name: '电影票（IMAX）', price: 85, category_id: 5, is_hot: true, description: 'IMAX巨幕，震撼视听体验' },
      { merchant_id: 8, name: '爆米花套餐', price: 38, category_id: 2, description: '香甜爆米花+饮料组合' },
    ];

    for (let i = 0; i < products.length; i++) {
      await this.productRepo.save(
        this.productRepo.create({ ...products[i], sort_order: i, images: [] } as any),
      );
    }
  }

  private async seedActivities() {
    const now = new Date();
    const activities = [
      {
        title: '五一黄金周大促销',
        content: '五一假期全场商品8折起，满500减100，积分双倍送！活动期间消费满200元可免费停车24小时。',
        type: ActivityType.FESTIVAL,
        start_time: new Date('2026-04-30'),
        end_time: new Date('2026-05-06'),
        status: ActivityStatus.ACTIVE,
        require_signup: false,
      },
      {
        title: '4月会员日特惠',
        content: '每月18日为华联会员日，会员专享9折优惠，积分消费享双倍抵扣，签到额外奖励50积分！',
        type: ActivityType.MEMBER_DAY,
        start_time: new Date('2026-04-18'),
        end_time: new Date('2026-04-18'),
        status: ActivityStatus.ENDED,
        require_signup: false,
      },
      {
        title: '春季新品发布会',
        content: '2026春夏新品正式上市，优衣库、无印良品等品牌同步更新，前100名购买新品享8折优惠。',
        type: ActivityType.PROMOTION,
        start_time: new Date('2026-04-01'),
        end_time: new Date('2026-04-30'),
        status: ActivityStatus.ACTIVE,
        require_signup: false,
      },
      {
        title: '幸运大转盘抽奖',
        content: '消费满100元即可参与幸运大转盘，奖品包括：购物券、积分、免费停车券、品牌礼品等。每日限参与3次。',
        type: ActivityType.LOTTERY,
        start_time: new Date('2026-04-20'),
        end_time: new Date('2026-05-20'),
        status: ActivityStatus.ACTIVE,
        require_signup: true,
      },
    ];

    for (const a of activities) {
      await this.activityRepo.save(this.activityRepo.create(a));
    }
  }

  private async seedAnnouncements() {
    const announcements = [
      {
        title: '华联商城五一营业时间调整通知',
        content: '五一假期（4月30日-5月6日）期间，商城营业时间调整为9:00-23:00，停车场24小时开放。祝大家节日快乐！',
        type: AnnouncementType.NOTICE,
        is_top: true,
        status: AnnouncementStatus.PUBLISHED,
        publish_at: new Date('2026-04-25'),
      },
      {
        title: '新店开业 | 喜茶正式入驻华联商城',
        content: '喜茶华联商城店将于5月1日正式开业，位于1F-08，开业当天前100名顾客享买一送一优惠，欢迎光临！',
        type: AnnouncementType.NEW_STORE,
        is_top: false,
        status: AnnouncementStatus.PUBLISHED,
        publish_at: new Date('2026-04-22'),
      },
      {
        title: '停车场系统升级维护公告',
        content: '华联商城停车场将于4月28日凌晨2:00-6:00进行系统升级维护，届时停车场出入口将暂时关闭，请提前安排出行。',
        type: AnnouncementType.PARKING,
        is_top: false,
        status: AnnouncementStatus.PUBLISHED,
        publish_at: new Date('2026-04-22'),
      },
    ];

    for (const a of announcements) {
      await this.announcementRepo.save(this.announcementRepo.create(a));
    }
  }

  private async seedCouponTemplates() {
    const templates = [
      {
        name: '满200减30元券',
        type: CouponType.CASH,
        value: 30,
        min_amount: 200,
        total_count: 1000,
        start_time: new Date('2026-04-01'),
        end_time: new Date('2026-05-31'),
        status: CouponTemplateStatus.ACTIVE,
      },
      {
        name: '全场9折优惠券',
        type: CouponType.DISCOUNT,
        value: 0.9,
        min_amount: 0,
        total_count: 500,
        start_time: new Date('2026-04-01'),
        end_time: new Date('2026-04-30'),
        status: CouponTemplateStatus.ACTIVE,
      },
      {
        name: '免费停车2小时券',
        type: CouponType.FREE_PARKING,
        value: 2,
        min_amount: 0,
        total_count: 200,
        start_time: new Date('2026-04-01'),
        end_time: new Date('2026-05-31'),
        status: CouponTemplateStatus.ACTIVE,
      },
    ];

    for (const t of templates) {
      await this.couponTemplateRepo.save(this.couponTemplateRepo.create(t));
    }
  }

  private async seedPointsAndConsumption() {
    const member = await this.memberRepo.findOne({ where: { phone: '13800138001' } });
    if (!member) return;

    const logs = [
      { type: PointsLogType.EARN, source: PointsLogSource.CONSUMPTION, points: 158, balance_after: 158, description: '消费获得积分' },
      { type: PointsLogType.EARN, source: PointsLogSource.CHECKIN, points: 5, balance_after: 163, description: '每日签到' },
      { type: PointsLogType.EARN, source: PointsLogSource.CONSUMPTION, points: 299, balance_after: 462, description: '消费获得积分' },
      { type: PointsLogType.CONSUME, source: PointsLogSource.PARKING, points: -100, balance_after: 362, description: '停车费抵扣1元' },
      { type: PointsLogType.EARN, source: PointsLogSource.ACTIVITY, points: 50, balance_after: 412, description: '连续签到7天奖励' },
    ];

    for (const log of logs) {
      await this.pointsLogRepo.save(
        this.pointsLogRepo.create({ ...log, member_id: member.id }),
      );
    }

    const consumptions = [
      { pos_order_id: 'POS20260401001', amount: 158, store_name: '优衣库', points_earned: 158, consumed_at: new Date('2026-04-01') },
      { pos_order_id: 'POS20260410002', amount: 299, store_name: '耐克运动', points_earned: 299, consumed_at: new Date('2026-04-10') },
      { pos_order_id: 'POS20260415003', amount: 680, store_name: '屈臣氏', points_earned: 680, consumed_at: new Date('2026-04-15') },
    ];

    for (const c of consumptions) {
      await this.consumptionRepo.save(
        this.consumptionRepo.create({ ...c, member_id: member.id }),
      );
    }
  }

  private async seedVehicles() {
    const members = await this.memberRepo.find();
    const vehicleData = [
      { phone: '13800138001', plates: [{ plate_number: '粤B12345', plate_color: '蓝', is_default: true }, { plate_number: '粤B88888', plate_color: '蓝', is_default: false }] },
      { phone: '13800138002', plates: [{ plate_number: '粤A66666', plate_color: '蓝', is_default: true }] },
      { phone: '13800138003', plates: [{ plate_number: '粤C99999', plate_color: '绿', is_default: true }] },
    ];
    for (const vd of vehicleData) {
      const member = members.find(m => m.phone === vd.phone);
      if (!member) continue;
      for (const plate of vd.plates) {
        await this.vehicleRepo.save(this.vehicleRepo.create({ member_id: member.id, ...plate }));
      }
    }
  }
}
