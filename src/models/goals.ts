import {
  ManyToOne,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Users } from './users';
import { UserGoals } from './usergoals';
import { Reports } from './reports';

@Entity()
export class Goals extends BaseEntity {
  // @ManyToOne(fetch = FetchType.LAZY)
  @ManyToOne(() => Users, (user) => user.goals, {
    onUpdate: 'CASCADE',
    //eager: true,
  })
  @JoinColumn({ name: 'userId' })
  userId: Users;

  @PrimaryGeneratedColumn()
  goalId: number;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  curCount: number;

  @Column({ nullable: false })
  headCount: number;

  @Column({ nullable: false })
  startDate: Date;

  @Column({ nullable: false })
  endDate: Date;

  @Column({ nullable: false })
  period: number;

  @Column({ nullable: false })
  status: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  isPrivate: boolean;

  @Column({ nullable: true })
  hashTag: string;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({
    type: 'timestamp',
    update: false,
  })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => UserGoals, (userGoal) => userGoal.goalId, {
    cascade: ['insert'],
  })
  userGoals: UserGoals[];

  @OneToMany(() => Reports, (report) => report.Goal, {
    cascade: ['insert'],
  })
  Reports: Reports[];
}
