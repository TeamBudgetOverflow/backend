import UserService from '../services/users.service';
import { Request, Response } from 'express';

class UserController{
    userService
    constructor() {
        this.userService = new UserService();
    }

    naverLogin = async(req:Request, res:Response) => {
        return true
    }
}

export default UserController;