import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Badges } from 'src/entity/badges';
import { UserBadges } from 'src/entity/userbadges';
import { UserGoals } from 'src/entity/usergoals';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Badges)
    private badgeRepository: Repository<Badges>,
    @InjectRepository(UserBadges)
    private userBadgeRepository: Repository<UserBadges>,
  ) {}

  // 뱃지 획득
  async getBadge(data, queryRunner: QueryRunner) {
    const isDuplicated = await this.duplicateBadgeSearch(data, queryRunner);
    if (!isDuplicated) {
      await this.saveBadge(data, queryRunner);
    }
  }

  // 뱃지 저장
  async saveBadge(data, queryRunner: QueryRunner) {
    await queryRunner.manager.getRepository(Badges).save(data);
  }

  // 유저가 획득한 뱃지 가져오기
  async getUserBadges(userId: number): Promise<UserBadges[]> {
    return await this.userBadgeRepository
      .createQueryBuilder('ub')
      .where('ub.User = :userId', { userId })
      .leftJoin('ub.Badges', 'badge')
      .select(['ub', 'badge.badgeId'])
      .getMany();
  }

  // 전체 뱃지 조회
  async getALLBadges(): Promise<Badges[]> {
    return await this.badgeRepository.find();
  }

  // 뱃지 중복 조회 방지
  async duplicateBadgeSearch(data, queryRunner: QueryRunner) {
    return await queryRunner.manager
      .getRepository(UserGoals)
      .createQueryBuilder('ub')
      .where('ub.User = :User', { User: data.User })
      .andWhere('ub.Badges = :Badges', { Badges: data.Badges })
      .getOne();
  }

  // 회원 탈퇴 시 뱃지 획득 내역 삭제
  async deleteBadgeInfo(userId: number, queryRunner: QueryRunner) {
    await queryRunner.manager.delete(UserBadges, { user: userId });
  }
}
