import {
  ManyToOne,
  Entity,
  BaseEntity,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Users } from './users';
import { Goals } from './goals';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Reports extends BaseEntity {
  @PrimaryGeneratedColumn()
  reportId: number;

  @ManyToOne(() => Users, (user) => user.Reports, {
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'User' })
  User: Users;

  @ManyToOne(() => Goals, (goal) => goal.Reports, {
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'Goal' })
  Goal: Goals;

  @IsString()
  @ApiProperty({
    example: '부적절한 언어가 포함되어있습니다',
    description: '신고 사유를 작성합니다',
    required: true,
  })
  @IsNotEmpty()
  @Column({ unique: false, nullable: true, name: 'reason' })
  reason: string;
}
