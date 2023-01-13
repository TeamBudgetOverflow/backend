import {
    ManyToOne,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
    JoinColumn,
  } from 'typeorm';
  import { Users } from './users';
  
  @Entity()
  export class Goals extends BaseEntity {
    @PrimaryGeneratedColumn()
    goalId: number;
  
    @Column({ nullable: false })
    amount: number;

    @Column({ nullable: false })
    startDate: Date;

    @Column({ nullable: false })
    endDate: Date;

    @Column({ nullable: false })
    headCount: number;

    // @Column({ nullable: true })
    // isPrivate: boolean;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    description: string;

    // @Column
    // hashtag: string;

    @ManyToOne(() => Users, (user) => user.goals, { onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    userId: Users;
  }