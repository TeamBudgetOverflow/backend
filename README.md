1. npm install
express
@types/express --save-dev
typescript -g

nodemon -D
@types/node --save-dev
nodemon ts-node -D

sequelize --save
sequelize-cli --save-dev
mysql2 --save 

eslint -D
prettier --save-dev --save-exact -D
// Prettier와 ESLint 함께 사용하기 위한 추가 모듈 설치
eslint-config-prettier --save-dev -D
eslint-plugin-prettier --save-dev -D

cors
@types/cors --save-dev
dotenv --save
jsonwebtoken

winston
+ winston-daily-rotate-file // 하루 단위로 새 로그 파일을 생성하여 로그 파일을 관리하는 모듈 고려

// oauth 구현시 passport OR axios 사용 선택해야함.
// 금융과 관련된 이유로 test가 불가피 해보임에 따라 jest 라이브러리 필요성에 대한 논의가 필요
// 강제로 3-layer-architecture가 요구되는 NestJS 라이브러리에 대한 논의 - 피드백 이후 고려