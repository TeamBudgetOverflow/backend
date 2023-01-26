import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
    ManyToOne,
    OneToMany,
    JoinColumn,
  } from 'typeorm';
import { Badges } from './badges';
import { Users } from './users';
  
  @Entity()
  export class UserBadges extends BaseEntity {
    @PrimaryGeneratedColumn()
    @JoinColumn()
    id: number;
  
    @Column({ unique: true })
    title: string;
  
    @Column({ unique: false })
    description: string;

    @ManyToOne(() => Badges, {
        onUpdate: 'CASCADE',
        nullable: false,
    })
    @JoinColumn([{ name: 'badgeId', referencedColumnName: 'id' }])
    Badges: Badges;

    @ManyToOne(() => Users, {
        onUpdate: 'CASCADE',
        nullable: false,
    })
    @JoinColumn([{ name: 'userId' }])
    User: Users;
  }