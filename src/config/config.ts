import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  development : {
    username : process.env.DB_USERNAME || 'root',
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DBNAME || 'taesanDB',
    host : process.env.DB_END_POINT,
    port : process.env.DB_PORT || 3306,
    dialect : "mysql"
  },
  test : {
    username : process.env.DB_USERNAME || 'root',
    password : process.env.DB_PASSWORD,
    database : process.env.DB_TESTDBNAME || 'taesanTestDB',
    host : process.env.DB_END_POINT,
    port : process.env.DB_PORT || 3306,
    dialect : "mysql"
  }
}