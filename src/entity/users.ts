import {
  Column,
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { Accounts } from './accounts';
import { Goals } from './goals';
import { UserBadges } from './userbadges';
import { UserGoals } from './usergoals';
import { Reports } from './reports';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  userId: number;

  @IsEmail()
  @ApiProperty({
    example: 'id@email.com',
    description: '이메일',
    required: true,
  })
  @IsNotEmpty()
  @Column({ unique: false, name: 'email' })
  email: string;

  @IsString()
  @ApiProperty({
    example: '홍길동',
    description: '이름 입니다.',
    required: true,
  })
  @IsNotEmpty()
  @Column({ unique: false })
  name: string;

  @IsString()
  @ApiProperty({
    example: 'nikcname',
    description: '닉네임 글자는 2~12자',
    required: true,
  })
  @IsNotEmpty()
  @Column({ unique: false, name: 'nickname', length: 12 })
  nickname: string;

  @IsString()
  @ApiProperty({
    example: 'image.jpg',
    description: 'jpg, jpeg, png 가능, gif불가능, 3MB 이하',
    required: false,
  })
  @Column({ nullable: true, name: 'image' })
  image: string;

  @IsString()
  @ApiProperty({
    example: 'google',
    description: 'google, kakao만 가능함',
    required: true,
  })
  @IsNotEmpty()
  @Column({ name: 'loginCategory' })
  loginCategory: string;

  @IsString()
  @ApiProperty({
    example: '123456',
    description: 'pinCode는 반드시 6글자여야 합니다.',
  })
  @Column({ nullable: true, name: 'pinCode' })
  pinCode: string;

  @IsString()
  @Column({ nullable: true, name: 'refreshToken' })
  refreshToken: string;

  @IsString()
  @ApiProperty({
    example: '자기소개 입니다.',
    description: '255자 이내로 작성되어야 합니다.',
    required: true,
  })
  @Column({ nullable: true, name: 'description', length: 255 })
  description: string;

  @OneToMany(() => Accounts, (account) => account.user, {
    cascade: ['insert'],
  })
  account: Accounts[];

  @OneToMany(() => Goals, (goal) => goal.userId, { cascade: ['insert'] })
  goals: Goals[];

  @OneToMany(() => UserGoals, (userGoal) => userGoal.userId, {
    cascade: ['insert'],
    lazy: true,
  })
  userGoals: UserGoals[];

  @OneToMany(() => UserBadges, (userBadge) => userBadge.User, {
    cascade: ['insert'],
  })
  UserBadge: UserBadges[];

  @OneToMany(() => Reports, (report) => report.User, {
    cascade: ['insert'],
  })
  Reports: Reports[];
}
