import { HttpService } from '@nestjs/axios';
import { Body, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError, AxiosResponse } from 'axios';
import {
  catchError,
  firstValueFrom,
  lastValueFrom,
  map,
  Observable,
} from 'rxjs';
import { Accounts } from 'src/models/accounts';
import { Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Accounts)
    private accountsRepository: Repository<Accounts>,
  ) {}
  async viewAccountBalance(userInfo, headers) {
    const url = 'https://api.hyphen.im/in0087000484';
    console.log(headers);
    const hkey = headers.hkey;
    const headersRequest = {
      'Content-Type': 'application/json',
      'Hkey': headers.hkey,
      'user-id': headers['user-id'],
    };

    console.log(headersRequest);

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
    console.log(result);
    return result;
  }
}
