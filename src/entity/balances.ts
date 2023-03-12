import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Accounts } from './accounts';
import { UserGoals } from './usergoals';

@Entity()
export class Balances extends BaseEntity {
  @PrimaryGeneratedColumn()
  balanceId: number;

  @Column()
  initial: number;

  @Column()
  current: number;

  @Column()
  chkType: string;

  @OneToMany(() => UserGoals, (userGoal) => userGoal.balanceId, {
    cascade: ['insert'],
  })
  userGoals: UserGoals[];
}
