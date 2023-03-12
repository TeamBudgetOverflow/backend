import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Users } from '../entity/users';
import { Goals } from '../entity/goals';
import { UserGoals } from '../entity/usergoals';
import { Accounts } from 'src/entity/accounts';
import { Banks } from 'src/entity/banks';
import { Balances } from 'src/entity/balances';
import { Badges } from 'src/entity/badges';
import { UserBadges } from 'src/entity/userbadges';
import { Reports } from 'src/entity/reports';

export async function getTypeOrmConfig(): Promise<TypeOrmModuleOptions> {
  const configService = new ConfigService();
  return {
    type: 'mysql',
    host: configService.get<string>('DB_END_POINT'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_TESTDBNAME'),
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
    synchronize: false,
    logging: true,
    keepConnectionAlive: true,
    timezone: '+09:00',
    charset: 'utf8mb4_general_ci',
  };
}
