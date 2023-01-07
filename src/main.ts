import * as dotenv from "dotenv";
import express, { Request, Response, NextFunction, Router } from 'express';
import cors from "cors";
//import { sequelize } from "./models";
const routes: Router = require('./routes/index.router');

dotenv.config();

const PORT:number = parseInt(process.env.PORT as string, 10) || 3000;
//const HOST:string = process.env.HOST || 'localhost';
const app = express();


app.use(cors());
app.use(express.json());
app.use((req:Request,res:Response,next:NextFunction) => {
    console.log(`Request Occur! ${req.method}, ${req.url}`);
    next();
})

app.use('/', routes);


app.listen(PORT, async () => {
    console.log(PORT, 'Server is running');
    //  await sequelize.authenticate()
    //  .then(async () => {
    //      console.log("connection success");
    //  })
    //  .catch((e) => {
    //      console.log('TT : ', e);
    //  })
})