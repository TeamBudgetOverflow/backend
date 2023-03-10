import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Users } from '../models/users';
import { Goals } from '../models/goals';
import { UserGoals } from '../models/usergoals';
import { Accounts } from 'src/models/accounts';
import { Banks } from 'src/models/banks';
import { Balances } from 'src/models/balances';
import { Badges } from 'src/models/badges';
import { UserBadges } from 'src/models/userbadges';
import { Reports } from 'src/models/reports';

dotenv.config();

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_END_POINT,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  entities: [
    Users,
    Goals,
    UserGoals,
    Accounts,
    Banks,
    Balances,
    Badges,
    UserBadges,
    Reports,
  ],
  //migrations: [__dirname + '/migrations/*.ts'],
  // 처음 db를 생성할 때만 synchronize:true로 생성하고, 이 후에는 false로 바꿔야 함
  synchronize: true,
  logging: true,
  keepConnectionAlive: true,
  timezone: '+09:00',
  charset: 'utf8mb4_general_ci',
};
