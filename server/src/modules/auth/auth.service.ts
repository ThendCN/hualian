import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member, MemberLevel, MemberSource } from '../../entities/member.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
    private jwtService: JwtService,
  ) {}

  async loginOrRegister(phone: string): Promise<{ token: string; member: Member; isNew: boolean }> {
    let member = await this.memberRepo.findOne({ where: { phone } });
    let isNew = false;

    if (!member) {
      // 格式：8862 XXXX XXXX
      const rand = () => Math.floor(1000 + Math.random() * 9000).toString();
      const memberNo = `8862 ${rand()} ${rand()}`;
      member = this.memberRepo.create({
        phone,
        nickname: '华联会员',
        member_no: memberNo,
        level: MemberLevel.NORMAL,
        total_points: 0,
        total_consumed: 0,
        year_consumed: 0,
        source: MemberSource.MINIAPP,
      });
      member = await this.memberRepo.save(member);
      isNew = true;
    }

    const token = this.jwtService.sign({ memberId: member.id, phone: member.phone });
    return { token, member, isNew };
  }

  async validateMember(id: number): Promise<Member | null> {
    return this.memberRepo.findOne({ where: { id } });
  }
}
