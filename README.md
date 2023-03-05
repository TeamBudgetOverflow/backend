# :moneybag: 티끌모아 태산 :moneybag:

<img src="https://user-images.githubusercontent.com/112388311/217845677-e83d12f7-7660-4493-a259-4db5356b1460.png" width="50%" height="50%">
<img src="https://user-images.githubusercontent.com/112388311/218279933-d172dd24-0cc1-4c61-862f-8c74726d7b36.JPG">

[배포 사이트](https://teekle-taesan.com/)

## 📺 You Tube 시연 영상
[이 링크를 클릭하시면 티끌 모아 태산의 시연 영상을 시청하실 수 있습니다.](https://youtu.be/m_Olv_2fK-s)

## 프로젝트 개요

:white_check_mark: **프로젝트 한줄 소개**

2030 재테크 병아리들을 위한 돈 모으기 습관 형성 서비스 입니다.

:white_check_mark: **기획 의도**

재테크 관심도가 높아지고 있는 2030 세대들을 위해 작은 금액부터 목표를 세우고 관리하는 저축 습관 형성 서비스를 제공하고자 했습니다.

:white_check_mark: **진행 기간**

| 총기간 | 2022.12.30 - 2023.02.09 |
|:-----:|:---------------:|
| 배포일 | 2022.02.03 |
| 서비스 개선 | 2022.02.09 ~ 백엔드 개선 진행중 [김수완](https://github.com/Grimdal032)|
<br/>

:white_check_mark: **BACKEND 구성원** 
<br/><br/>
| 포지션 | 이름 | 담당 | github |
|:--:|:--:|:------:|:---:|
| BE🔰 | 류제승 | 구글 로그인, 계좌 조회, 계좌 생성, 계좌 삭제, 특정 계좌 정보 조회, 유저 프로필 보기 및 수정, 뱃지 획득 로직, 계좌 잔액 조회, 특정 은행 조회, 전체 은행 조회, 목표완료/탈퇴/실패시 계좌 상태 업데이트 로직 구현 | https://github.com/crystalyst |
| BE | 김수완 | 네이버 로그인, 핀코드 발급/수정, 액세스 토큰 재발급, 로그아웃, 회원 탈퇴, 유저의 목표 리스트, 보유 뱃지 보기, 뱃지 획득 로직, 계좌 잔액 수정, 목표 생성, 수정, 삭제, 참가, 탈퇴,  전체 목표 보기, 상세 보기,  목표 검색,  임박 목표 불러오기, 신고하기 | https://github.com/Grimdal032 |
| BE | 김주향 | 카카오 로그인 | https://github.com/joohyang0612

## 🧰기술 스택 & 협업
**Back-End**
<div align="start">
  <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=black">
  <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=black">
  <img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=black">
  <img src="https://img.shields.io/badge/passport-34E27A?style=for-the-badge&logo=passport&logoColor=black">
  <img src="https://img.shields.io/badge/JSON WEB TOKENS-000000?style=for-the-badge&logo=JSON WEB TOKENS&logoColor=white">
  <img src="https://img.shields.io/badge/AWS EC2-FF920F?style=for-the-badge">
  <img src="https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=black">
</div>
<br/>

**Tools**
<div>
  <img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=github&logoColor=white">
  <img src="https://img.shields.io/badge/NOTION-181717?style=for-the-badge&logo=notion&logoColor=white">
  <img src="https://img.shields.io/badge/SLACK-4A154B?style=for-the-badge&logo=slack&logoColor=white">
</div>

##  🛠️ 서비스 아키텍쳐

![서비스 아키텍처](https://user-images.githubusercontent.com/112388311/222979863-754771dd-8937-49ea-bd11-f12b4b3cec0f.png)

## 🔧 기술적 의사결정
### 🙂 Back-end
| **사용 기술** | **기술 설명** |
|-----|:---------------:|
| Nest.JS | MVC 구조를 강제하는 프레임워크이기 때문에, Express로 3-layer architecture를 수동으로 구현하는 것보다 더 효율적이고, 서로의 코드를 이해하는 것이 더 수월하다고 판단. |
| MySQL | 오픈 소스 대비 빠른 처리 속도, 표준 SQL 형식을 사용, 안정적이며 기능 개발 및 오류 발생시 많은 기업들이 사용하여 자료가 풍부함. |
| TypeORM | TypeScript와의 호환성이 높아 코드의 가독성이 좋아지고 유지보수가 쉬워짐. 쿼리 빌더 사용으로 복잡한 쿼리를 간단하게 작성 가능 |
| Passport | 카카오, 구글, 네이버 각각의 인증기관의 각자 다른 인증 방법, 구현 방법의 복잡성을 어느정도 통일화 시킬 수 있다는 장점. |
| JWT | 서버의 부하를 줄일 수 있고 보안성이 뛰어나며 클라이언트 측에서 발급되는 토큰을 사용하여 인증 요청을 간단하게 처리할 수 있음. |
| Cron | CRON 모듈식 표현으로 스케쥴링 구현이 쉽고 유지보수하기 좋은 코드 작성 |

## 서비스 핵심기능
<img src="https://user-images.githubusercontent.com/112388311/218279966-4a1f1b4b-1469-43de-b33e-81fb8f2e88b4.JPG" width="70%" height="70%">
<img src="https://user-images.githubusercontent.com/112388311/218279972-4004a042-ca85-4666-b480-aa42ef1b2417.JPG" width="70%" height="70%">
<img src="https://user-images.githubusercontent.com/112388311/218279978-8ec47534-a4f6-4e13-85b4-b19e80d1d467.JPG" width="70%" height="70%">
<img src="https://user-images.githubusercontent.com/112388311/218279983-404c88e0-4cef-4343-93e6-e20d16516f96.JPG" width="70%" height="70%">

## 🔥 트러블 슈팅



## 📄 DB ERD
<img src="https://user-images.githubusercontent.com/112388311/217857714-6a2cb315-63b0-46d4-a8e5-873fc6948d58.png">

## API 명세 / 와이어프레임

📓: [API](https://www.notion.so/MVP-09346594381b498d94bbaf4f629193a9)
🎨: [Figma](https://www.figma.com/file/XZx7V517CCYsc55go50xMZ/%ED%8B%B0%EB%81%8C%EB%AA%A8%EC%95%84%ED%83%9C%EC%82%B0?node-id=0%3A1&t=L9PpVmOEUqOAIzOP-0)

## 📣 마케팅 전략
### 🏷️ 항해 99 내 약 3천명의 개발자에게 홍보
📭 전략:
1. 개발자들이 많은 만큼, UI/UX 측면의 피드백과 기술적인 피드백을 받을 수 있었습니다.
2. 기프티콘을 통해 설문조사 참여에 동기를 부여하여 다양한 유저 피드백을 받기 위해 투자

📺 홍보 자료:

![image](https://user-images.githubusercontent.com/112388311/222980905-d25d2b91-08d2-46eb-9c6f-a02b3574c396.png)

## 🧑🏻‍🔧 피드백 개선
### 🏷️ 신고하기 기능 및 가리기(Soft Delete)
📭 **피드백**: 목표 이름이나 설명에 불건전한 단어가 있어 보기 불편함. 추가 조치할 수 있으면 좋겠다.
🧰 **개선 결과**:
![image](https://user-images.githubusercontent.com/112388311/222981388-6da4980e-8b4a-4f6d-9085-e582953b81b6.png)

