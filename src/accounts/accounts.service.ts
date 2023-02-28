import { HttpService } from '@nestjs/axios';
import { Body, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AxiosError, AxiosResponse } from 'axios';
import { Not } from 'typeorm';
import {
  catchError,
  firstValueFrom,
  lastValueFrom,
  map,
  Observable,
} from 'rxjs';
import { Accounts } from 'src/entity/accounts';
import { Balances } from 'src/entity/balances';
import { UserGoals } from 'src/entity/usergoals';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Accounts)
    private accountsRepository: Repository<Accounts>,
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Balances)
    private balancesRepository: Repository<Balances>,
    @InjectRepository(UserGoals)
    private userGoalsRepository: Repository<UserGoals>,
  ) {}
  async viewAccountBalance(userInfo, headers) {
    const url = 'https://api.hyphen.im/in0087000484';
    // console.log(headers);
    const hkey = headers.hkey;
    const headersRequest = {
      'Content-Type': 'application/json',
      Hkey: headers.hkey,
      'user-id': headers['user-id'],
    };

    // console.log(headersRequest);

    const resp = await this.httpService
      .post(url, userInfo, { headers: headersRequest })
      .pipe(
        map((response) => {
          return response.data;
        }),
      );

    return resp;
  }

  async addAccount(data): Promise<Accounts> {
    const result = await this.accountsRepository.save(data);
    return result;
  }

  async updateAccountAssignment(accountId): Promise<Accounts> {
    const result = await this.accountsRepository.findOne({
      where: {
        accountId,
        active: true,
      },
    });

    result.assigned = true;
    await this.accountsRepository.save(result);
    return result;
  }

  // might need to use querybuilder
  async getAccounts(targetUser): Promise<Accounts[]> {
    console.log(typeof targetUser); // 5
    const result: Accounts[] = await this.accountsRepository.find({
      where: {
        userId: targetUser,
        bank: {
          id: Not(2),
        },
        active: true,
      },
      select: {
        accountId: true,
        acctNo: true,
        bank: {
          id: true,
        },
      },
      order: {
        accountId: 'ASC',
      },
    });

    return result;
  }

  // might need to use querybuilder
  async getAllAccounts(targetUser): Promise<Accounts[]> {
    const result: Accounts[] = await this.accountsRepository.find({
      where: {
        userId: targetUser,
        active: true,
      },
      select: {
        accountId: true,
        acctNo: true,
        bank: {
          id: true,
        },
      },
      order: {
        accountId: 'ASC',
      },
    });

    return result;
  }

  // might need to use querybuilder
  async getManualAccounts(targetUser): Promise<Accounts[]> {
    console.log(typeof targetUser); // 5
    const result: Accounts[] = await this.accountsRepository.find({
      where: {
        userId: targetUser,
        bank: {
          id: 2,
        },
        active: true,
      },
      select: {
        accountId: true,
        acctNo: true,
        bank: {
          id: true,
        },
      },
      order: {
        accountId: 'ASC',
      },
    });

    return result;
  }

  async getIndivAccount(accountId: number) {
    const result: Accounts = await this.accountsRepository.findOne({
      where: {
        accountId,
        active: true,
      },
    });

    return result;
  }

  async getAccountBalance(accountId: number) {
    const result: UserGoals[] = await this.userGoalsRepository.find({});
    const targetBalance = [];
    for (let i = 0; i < result.length; i++) {
      const { accountId: account, balanceId: balance } = result[i];
      const { current } = balance;
      if (account.accountId === accountId) {
        targetBalance.push({ balance: current });
        break;
      }
    }
    return targetBalance[0];
  }

  async getConnectedAccounts(targetUserId: number) {
    console.log(targetUserId);
    const result: UserGoals[] = await this.userGoalsRepository.find({});
    const targetAccounts = [];
    for (let i = 0; i < result.length; i++) {
      // console.log(userId)
      const { accountId: account, status } = result[i];
      const { userId } = account.user;
      if (
        userId === targetUserId &&
        (status === 'in progress' || status === 'pending')
      ) {
        targetAccounts.push(account.accountId);
      }
    }

    return targetAccounts;
  }

  async deleteAccount(targetAccountId: number) {
    const result = await this.accountsRepository.findOne({
      where: {
        accountId: targetAccountId,
      },
    });

    result.active = false; // delete/deactivate
    result.bankUserId = null;
    result.bankUserPw = null;
    result.acctNo = null;
    result.acctPw = null;
    await this.accountsRepository.save(result);
    return result;
  }
}
