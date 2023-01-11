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

    findUserById(userId: number): Promise<Users> {
        let option = {
          where: { userId },
          offset: 0,
          limit: 1,
          raw: true,
        };
        return this.usersRepository.findOne(option);
    } 

    oauthCreateUser(user: Users): Promise<Users> {
          // let value : {
          //   email: string, 
          //   name: string, 
          //   nickname: string, 
          //   image: string, 
          //   loginCategory: string,
          //   pinCode: string,
          //   refreshToken: string,
          //   description: string,
          // } = {
          //   email: user.email, 
          //   name: user.name, 
          //   nickname: user.nickname, 
          //   image: user.image, 
          //   loginCategory: user.loginCategory,
          //   pinCode: null,
          //   refreshToken: null,
          //   description: null,
          // }
        console.log("create user");
        return this.usersRepository.save(user);
    }

    async createRefreshToken(userId: number, refreshToken: string){
      console.log("save refreshToken");
        const findUserUpdate = await this.usersRepository.findOneBy({userId});
        findUserUpdate.refreshToken = refreshToken;
        await this.usersRepository.save(findUserUpdate);
    }
    
}