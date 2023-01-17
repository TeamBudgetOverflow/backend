import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
} from 'typeorm';
import { Accounts } from './accounts';

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

  //   @OneToOne(() => Accounts, (account) => account.balance, {
  //     cascade: ['insert'],
  //   })
  //   account: Accounts;
}
