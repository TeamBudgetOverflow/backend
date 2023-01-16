import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Balances } from './balances';
import { Banks } from './banks';

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

  // @OneToOne(() => Balances, (balance) => balance.account, {
  //   cascade: ['insert'],
  // })
  // balance: Balances;

  @ManyToOne(() => Banks, (bank) => bank.account, {
    onUpdate: 'CASCADE',
  })
  bank: Banks;
}
