import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ChannelChats } from './channelChats';
  import { Users } from './users';
  
  @Entity()
  export class Channels {
    @PrimaryGeneratedColumn({ type: 'int' })
    channelId: number;
  
    @Column('varchar', { name: 'name', length: 30 })
    name: string;
  
    @Column('tinyint', {
      name: 'private',
      nullable: true,
      width: 1,
      default: () => "'0'",
    })
    private: boolean | null;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @OneToMany(() => ChannelChats, (channelChat) => channelChat.channelId)
    channelChatId: ChannelChats[];
  
    @ManyToOne(() => Users, {
        onUpdate: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'userId' })
    userId: Users;
  }