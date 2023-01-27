import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Balances } from './balances';
import { Banks } from './banks';
import { Users } from './users';
import { UserGoals } from './usergoals';

@Entity()
export class Accounts extends BaseEntity {
  @PrimaryGeneratedColumn()
  accountId: number;

  @Column({ unique: false, nullable: true })
  bankUserId: string;

  @Column({ unique: false, nullable: true })
  bankUserPw: string;

  @Column({ unique: false, nullable: true })
  acctNo: string;

  @Column({ unique: false, nullable: true })
  acctPw: string;

  @Column({ unique: false, default: false })
  assigned: boolean;

  // @OneToOne(() => Balances, (balance) => balance.account, {
  //   cascade: ['insert'],
  // })
  // balance: Balances;

  @Column({ name: 'userId' })
  userId: number;
  @ManyToOne(() => Users, (user) => user.account, {
    nullable: false,
    eager: true,
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Banks, (bank) => bank.account, {
    nullable: false,
    eager: true,
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'bankId' })
  bank: Banks;

  @OneToMany(() => UserGoals, (userGoal) => userGoal.accountId, {
    cascade: ['insert'],
  })
  userGoals: UserGoals[];
}
