import {
  Column,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Accounts } from './accounts';
import { Goals } from './goals';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
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

  @OneToMany(() => Goals, (goal) => goal.user, { cascade: ['insert'] })
  goals: Goals[];
}
