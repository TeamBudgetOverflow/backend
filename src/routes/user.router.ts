import express, { Router } from 'express';
const router: Router = express.Router();
import UsersController from '../controllers/users.controller'
const usersController = new UsersController();


router.post('/signup/naver', usersController.naverLogin);

export default router;