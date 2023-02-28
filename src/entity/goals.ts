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
import { Reports } from './reports';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';

@Entity()
export class Goals extends BaseEntity {
  // @ManyToOne(fetch = FetchType.LAZY)
  @ManyToOne(() => Users, (user) => user.goals, {
    onUpdate: 'CASCADE',
    //eager: true,
  })
  @JoinColumn({ name: 'userId' })
  userId: Users;

  @PrimaryGeneratedColumn({ type: 'int', name: 'goalId' })
  goalId: number;

  @IsNumber()
  @ApiProperty({
    example: '1000~70000',
    description: '목표 금액으로 Int 1000~70000 사이의 숫자여야함.',
    required: true,
  })
  @Min(1000)
  @Max(70000)
  @Column({ nullable: false, name: 'amount', type: 'int' })
  amount: number;

  @IsNumber()
  @ApiProperty({
    example: '1~hadCount(number)',
    description: '1~모집 인원 수 이내의 숫자여야함.',
    required: true,
  })
  @Min(1)
  @Column({ nullable: false, name: 'curCount', type: 'int' })
  curCount: number;

  @IsNumber()
  @ApiProperty({
    example: '1~100',
    description: '모집 인원수는 최대 100명입니다.',
    required: true,
  })
  @Min(1)
  @Max(100)
  @Column({ nullable: false, name: 'headCount', type: 'int' })
  headCount: number;

  @IsDate()
  @ApiProperty({
    example: '20xx.xx.xx',
    description: '시작 일자',
    required: true,
  })
  @Column({ nullable: false, name: 'startDate' })
  startDate: Date;

  @IsDate()
  @ApiProperty({
    example: '20xx.xx.xx',
    description: '종료 일자',
    required: true,
  })
  @Column({ nullable: false, name: 'endDate' })
  endDate: Date;

  @IsNumber()
  @ApiProperty({
    example: 'number',
    description: '종료 날짜 - 시작 날짜',
    required: true,
  })
  @Column({ nullable: false, name: 'period' })
  period: number;

  @IsString()
  @ApiProperty({
    example: 'recruit',
    description: 'recruit -> proceeding -> done',
    required: true,
  })
  @Column({ nullable: false, name: 'status' })
  status: string;

  @IsString()
  @ApiProperty({
    example: 'This is Title',
    description: '제목의 길이는 4글자 이상 25글자 이하입니다.',
    required: true,
  })
  @Min(4)
  @Max(25)
  @Column({ nullable: false, name: 'title', type: 'varchar' })
  title: string;

  @IsBoolean()
  @ApiProperty({
    example: 'true, false',
    description:
      'true - 다른 유저에게 보이지 않기, false - 다른 유저에게도 공개',
    required: true,
  })
  @Column({ nullable: true, name: 'isPrivate' })
  isPrivate: boolean;

  @IsString()
  @ApiProperty({
    example: '해시태그,입니다',
    description: '배열로 입력받아 string 형태로 변환합니다.',
    required: true,
  })
  @Column({ nullable: true, name: 'hashTag' })
  hashTag: string;

  @IsString()
  @ApiProperty({
    example: 'Smile!',
    description: '목표 등록 및 수정에 사용되는 대표 이미지입니다.',
    required: false,
  })
  @Column({ nullable: true, name: 'emoji' })
  emoji: string;

  @IsString()
  @ApiProperty({
    example: 'This is description',
    description: '목표 설명은 255자를 넘을 수 없습니다.',
    required: false,
  })
  @Min(0)
  @Max(255)
  @Column({ nullable: true, name: 'description', type: 'varchar' })
  description: string;

  @IsDate()
  @CreateDateColumn({
    type: 'timestamp',
    update: false,
  })
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => UserGoals, (userGoal) => userGoal.goalId, {
    cascade: ['insert'],
  })
  userGoals: UserGoals[];

  @OneToMany(() => Reports, (report) => report.Goal, {
    cascade: ['insert'],
  })
  Reports: Reports[];
}
