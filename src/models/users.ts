import {
  Column,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Accounts } from './accounts';
import { Goals } from './goals';
import { UserGoals } from './usergoals';
import { Channels } from './channels';
import { ChannelChats } from './channelChats';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  userId: number;

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

  @OneToMany(() => Goals, (goal) => goal.userId, { cascade: ['insert'] })
  goals: Goals[];

  @OneToMany(() => UserGoals, (userGoal) => userGoal.userId, {
    cascade: ['insert'],
    lazy: true,
  })
  userGoals: UserGoals[];

  @OneToMany(() => ChannelChats, (channelchats) => channelchats.User, {
    cascade: ['insert']
  })
  ChannelChat: ChannelChats[];

  @OneToMany(() => Channels, (channel) => channel.userId, {
    cascade: ['insert'],
  })
  channelId: Channels[];
}
