import {
  ManyToOne,
  Entity,
  BaseEntity,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Users } from './users';
import { Goals } from './goals';

@Entity()
export class Reports extends BaseEntity {
  @PrimaryGeneratedColumn()
  reportId: number;

  @ManyToOne(() => Users, (user) => user.Reports, {
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'User' })
  User: Users;

  @ManyToOne(() => Goals, (goal) => goal.Reports, {
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'Goal' })
  Goal: Goals;

  @Column({ unique: false, nullable: true })
  reason: string;
}
