import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../models/users';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
        private usersRepository: Repository<Users>,
    ) {}
    findUserByEmail(email: string): Promise<Users> {
        let option = {
          where: { email },
          offset: 0,
          limit: 1,
          raw: true, //조회한 결과 객체로만 표기 옵션
        };
        return this.usersRepository.findOne(option);
    }  

    findUserById(id: number): Promise<Users> {
        let option = {
          where: { id },
          offset: 0,
          limit: 1,
          raw: true,
        };
        return this.usersRepository.findOne(option);
    } 

    oauthCreateUser(user: Users): Promise<Users> {
        return this.usersRepository.save(user);
    }

    async createRefreshToken(id: number, refreshToken: string){
      console.log("save refreshToken");
        const findUserUpdate = await this.usersRepository.findOneBy({id});
        findUserUpdate.refreshToken = refreshToken;
        await this.usersRepository.save(findUserUpdate);
    }

    async registerPinCode(id: number, cryptoPinCode: string){
      const findUserUpdate = await this.usersRepository.findOneBy({id});
      findUserUpdate.pinCode = cryptoPinCode;
      await this.usersRepository.save(findUserUpdate);
    }
    
    async findUserByPinAndRefresh(refreshToken: string, pinCode: string): Promise<Users> {
      return await this.usersRepository.findOneBy({refreshToken, pinCode});
    }
}