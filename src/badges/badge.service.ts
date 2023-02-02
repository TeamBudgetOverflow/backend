import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Badges } from 'src/models/badges';
import { UserBadges } from 'src/models/userbadges';
import { Repository } from 'typeorm';
import { GetBadgeDTO } from './dto/getBadge.dto';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Badges)
    private badgeRepository: Repository<Badges>,
    @InjectRepository(UserBadges)
    private userBadgeRepository: Repository<UserBadges>,
  ) {}

  // 뱃지 획득
  async getBadge(data/*: GetBadgeDTO*/){
    return await this.userBadgeRepository.save(data);
  }

  // 유저가 획득한 뱃지 가져오기
  async getUserBadges(userId: number): Promise<UserBadges[]> {
    const result/*: UserBadges[]*/ =  await this.userBadgeRepository
      .createQueryBuilder('ub')
      .where('ub.User = :userId', {userId})
      .leftJoin('ub.Badges', 'badge')
      .select(['ub', 'badge.badgeId'])
      .getMany();
    return result;
  }

  // 전체 뱃지 조회
  async getALLBadges(): Promise<Badges[]> {
    return await this.badgeRepository.find();
  }

  // 회원 탈퇴 시 뱃지 획득 내역 삭제
  async deleteBadgeInfo(userId: number) {
    return await this.userBadgeRepository
      .createQueryBuilder('user_badges')
      .delete()
      .from('user_badges')
      .where('User = :userId', {userId})
      .execute();
  }
}
