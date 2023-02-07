import {
  Column,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  JoinColumn,
} from 'typeorm';
import { Accounts } from './accounts';
import { Goals } from './goals';
import { UserBadges } from './userbadges';
import { UserGoals } from './usergoals';
import { Reports } from './reports';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: false })
  email: string;

  @Column({ unique: false })
  name: string;

  @Column({ unique: false })
  nickname: string;

  @Column({ nullable: true })
  image: string;

  @Column()
  loginCategory: string;

  @Column({ nullable: true })
  pinCode: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
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
