import express, { Router } from 'express';
import userRouter from "./user.router";

const router: Router = express.Router();

router.use('/users', userRouter);

//export default router; why?
module.exports = router;