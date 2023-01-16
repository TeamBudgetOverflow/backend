import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Accounts } from './accounts';

@Entity()
export class Banks extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  bankCode: string;

  @OneToMany(() => Accounts, (account) => account.bank, {
    cascade: ['insert'],
  })
  account: Accounts[];
}
