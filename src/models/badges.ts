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
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    @JoinColumn()
    id: number;
  
    @Column({ unique: true })
    title: string;
  
    @Column()
    description: string;
  
    @OneToMany(() => UserBadges, (userBadges) => userBadges.Badges, {
        cascade: ['insert'],
    })
    UserBadge: UserBadges[];
  }