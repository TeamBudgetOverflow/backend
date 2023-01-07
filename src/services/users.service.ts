import UserRepository from '../repositories/users.repository';
import { Request, Response } from 'express';

class UserService{
    userRepository
    constructor() {
        this.userRepository = new UserRepository();
    }

    
}

export default UserService;