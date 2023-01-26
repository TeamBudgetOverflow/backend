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
    userBadgeId: number;

    @ManyToOne(() => Badges, {
        onUpdate: 'CASCADE',
        nullable: false,
    })
    @JoinColumn([{ name: 'badgeId' }])
    Badges: Badges;

    @ManyToOne(() => Users, {
        onUpdate: 'CASCADE',
        nullable: false,
    })
    @JoinColumn([{ name: 'userId' }])
    User: Users;
  }