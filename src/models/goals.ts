import {
    ManyToOne,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
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

    @ManyToOne(() => Users, (user) => user.goal)
    user: Users;
  }