import {
    ManyToOne,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Users } from './users';
  import { UserGoals } from './usergoals';
  
  @Entity()
  export class Goals extends BaseEntity {
    //@Column({ nullable: false })
    @ManyToOne(() => Users, (user) => user.goals, { onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    //@Column({ nullable: false })
    userId: Users;

    @PrimaryGeneratedColumn()
    goalId: number;
  
    @Column({ nullable: false })
    amount: number;

    @Column({ nullable: false })
    startDate: Date;

    @Column({ nullable: false })
    endDate: Date;

    @Column({ nullable: false })
    curCount: number;

    @Column({ nullable: false })
    headCount: number;

    // @Column({ nullable: true })
    // isPrivate: boolean;

    // @Column({ nullable: true })
    // isAuto: boolean;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    description: string;

    @Column({ nullable: true })
    hashTag: string;

    @Column({ nullable: false })
    createUserId: number;

    @CreateDateColumn({ 
      type: "timestamp",
      update: false,
     })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @OneToMany(() => UserGoals, (userGoal) => userGoal.goalId, { cascade: ['insert'] })
    userGoals: UserGoals[];
  }