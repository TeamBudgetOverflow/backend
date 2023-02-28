import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
    ManyToOne,
    OneToMany,
    JoinColumn,
  } from 'typeorm';
import { UserBadges } from './userbadges';
  
  @Entity()
  export class Badges extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    @JoinColumn()
    badgeId: number;
  
    @Column({ unique: true })
    title: string;
  
    @Column()
    description: string;

    @Column()
    image: string;
  
    @OneToMany(() => UserBadges, (userBadges) => userBadges.Badges, {
        cascade: ['insert'],
    })
    UserBadge: UserBadges[];
  }