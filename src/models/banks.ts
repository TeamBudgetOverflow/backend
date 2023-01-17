import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Accounts } from './accounts';

@Entity()
export class Banks extends BaseEntity {
  @PrimaryGeneratedColumn()
  @JoinColumn()
  id: number;

  @Column({ unique: true })
  bankCode: string;

  @Column({ unique: true })
  bankName: string;

  @OneToMany(() => Accounts, (account) => account.bank, {
    cascade: ['insert'],
  })
  account: Accounts[];
}
