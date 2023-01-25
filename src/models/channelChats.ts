import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Users } from './users';
  import { Channels } from './channels';
  
  @Entity()
  export class ChannelChats {
    @PrimaryGeneratedColumn({ type: 'int'})
    channelChatId: number;
  
    @Column('text', { name: 'content' })
    content: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // @Column('int', { name: 'UserId', nullable: true })
    // UserId: number | null;
  
    // @Column('int', { name: 'ChannelId', nullable: true })
    // ChannelId: number | null;
  
    @ManyToOne(() => Users, {
      onUpdate: 'CASCADE',
      nullable: false,
    })
    @JoinColumn({ name: 'userId' })
    User: Users;
  
    @ManyToOne(() => Channels, {
      onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'channelId' })
    channelId: Channels;
  }