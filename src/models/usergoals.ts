import {
  ManyToOne,
  Entity,
  BaseEntity,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './users';
import { Goals } from './goals';
import { Accounts } from './accounts';

@Entity()
export class UserGoals extends BaseEntity {
  @PrimaryGeneratedColumn()
  userGoalsId: number;

  @ManyToOne(() => Users, (user) => user.userGoals, {
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  userId: Users;

  @ManyToOne(() => Goals, (goal) => goal.userGoals, {
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'goalId' })
  goalId: Goals;

  @ManyToOne(() => Accounts, (account) => account.userGoals, {
    onUpdate: 'CASCADE',
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'accountId' })
  accountId: Accounts;

  // accountId - many to one
}
