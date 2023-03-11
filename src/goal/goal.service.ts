import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountsService } from 'src/accounts/accounts.service';
import { BadgeService } from 'src/badges/badge.service';
import { GetBadgeDTO } from 'src/badges/dto/getBadge.dto';
import { BalanceService } from 'src/balances/balances.service';
import { InitBalanceDTO } from 'src/balances/dto/initBalance.dto';
import { Balances } from 'src/entity/balances';
import { UserGoals } from 'src/entity/usergoals';
import { AccessUserGoalDTO } from 'src/usergoal/dto/accessUserGoals.dto';
import { CreateUserGoalDTO } from 'src/usergoal/dto/createUserGoals.dto';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import {
  Repository,
  Brackets,
  Between,
  DeepPartial,
  DataSource,
  QueryRunner,
} from 'typeorm';
import { Goals } from '../entity/goals';
import { UpdateGoalDTO } from '../goal/dto/updateGoal.dto';
import { InputCreateGoalDTO } from './dto/inputCreateGoal.dto';
import { InputUpdateGoalDTO } from './dto/inputUpdateGoal.dto';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goals)
    private goalRepository: Repository<Goals>,
    @Inject(forwardRef(() => BalanceService))
    private readonly balanceService: BalanceService,
    @Inject(forwardRef(() => BadgeService))
    private readonly badgeService: BadgeService,
    @Inject(forwardRef(() => AccountsService))
    private readonly accountService: AccountsService,
    private readonly usergoalService: UserGoalService,
    private dataSource: DataSource,
  ) {}

  async createGoalLogic(
    createGoalDTO: InputCreateGoalDTO,
    userId: number,
  ): Promise<Goals> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1. 첫 개인 목표/그룹 목표 생성 시 뱃지 획득 로직
      await this.getBadgeValidation(userId, createGoalDTO, queryRunner);
      // 2. 목표 생성 - 데이터 조립 / 생성
      const result = await this.createGoal(createGoalDTO, userId, queryRunner);
      // 3. 내가 만든 목표 자동 참가
      await this.createGoalJoin(result, createGoalDTO, userId, queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async createGoal(
    createGoalDTO: InputCreateGoalDTO,
    userId: number,
    queryRunner: QueryRunner,
  ) {
    const data = await this.createGoalDataProcess(createGoalDTO, userId);
    return await queryRunner.manager.getRepository(Goals).save(data);
  }

  async createGoalDataProcess(
    createGoalDTO: InputCreateGoalDTO,
    userId: number,
  ) {
    // hashTag : Array -> String 변환
    const hashTag = await this.hashArrayTohashString(createGoalDTO.hashTag);
    // isPrivate default Value = false
    let isPrivate = false;
    if (createGoalDTO.isPrivate) {
      isPrivate = createGoalDTO.isPrivate;
    }
    const curCount = 1;
    const end: Date = new Date(createGoalDTO.endDate);
    const start: Date = new Date(createGoalDTO.startDate);
    const period: number =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    // 목표 생성 데이터
    const data: DeepPartial<Goals> = {
      isPrivate: isPrivate,
      userId: { userId },
      curCount,
      amount: createGoalDTO.amount,
      startDate: start,
      endDate: end,
      period: period,
      status: 'recruit',
      headCount: createGoalDTO.headCount,
      title: createGoalDTO.title,
      description: createGoalDTO.description,
      hashTag: hashTag,
      emoji: createGoalDTO.emoji,
    };
    return data;
  }

  async createGoalJoin(
    result: Goals,
    createGoalDTO: InputCreateGoalDTO,
    userId,
    queryRunner: QueryRunner,
  ) {
    const goalId: number = result.goalId;
    const accountId: number = createGoalDTO.accountId;
    // update account field 'assigned' to true
    await this.accountService.updateAccountAssignment(accountId, queryRunner);
    const balanceData: InitBalanceDTO = {
      initial: 0,
      current: 0,
      chkType: 'Direct Input',
    };
    const balanceCreate: Balances = await this.balanceService.initBalance(
      balanceData,
      queryRunner,
    );
    const balanceId: number = balanceCreate.balanceId;
    let userGoalStatus: string;
    if (result.headCount === 1) userGoalStatus = 'in progress';
    else userGoalStatus = 'pending';
    // 내가 만든 목표 자동 참가
    const createUserGoalData: CreateUserGoalDTO = {
      userId,
      goalId,
      accountId,
      balanceId,
      status: userGoalStatus,
    };
    await this.usergoalService.joinGoal(createUserGoalData, queryRunner);
  }

  // 이미 목표에 연결된 계좌인지 검증
  async verifyLinkedAccount(accountId: number, userId: number) {
    const checkRegister: UserGoals = await this.usergoalService.findUser({
      accountId,
      userId,
    });
    if (checkRegister) {
      throw new HttpException(
        '이미 목표에 연결된 계좌 입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // hashTag : Array -> String 변환
  async hashArrayTohashString(hahsArray: string[]) {
    let hashTag = '';
    for (let i = 0; i < hahsArray.length; i++) {
      if (i == hahsArray.length - 1) {
        hashTag += hahsArray[i];
      } else {
        hashTag += hahsArray[i] + ',';
      }
    }
    return hashTag;
  }

  // 첫 개인 목표/그룹 목표 생성 시 뱃지 획득 로직
  async getBadgeValidation(
    userId: number,
    createGoalDTO: InputCreateGoalDTO,
    queryRunner: QueryRunner,
  ) {
    const pastCreateGoalData = await this.usergoalService.getGoalByUserId(
      userId,
    );
    let personalCount = 0;
    let groupCount = 0;
    for (let i = 0; i < pastCreateGoalData.length; i++) {
      // 생성자 본인에 대한 데이터 필터링
      if (pastCreateGoalData[i].userId.userId == userId) {
        if (pastCreateGoalData[i].goalId.headCount === 1) personalCount += 1;
        else groupCount += 1;
      }
    }
    let badgeId: number;
    // 개인 목표 - status: 진행중proceeding
    // 팀 목표 - status: 모집중recruit
    let status: string;
    if (createGoalDTO.headCount === 1) {
      status = 'proceeding';
      if (personalCount === 0) {
        // 개인 목표 첫 생성 뱃지 획득
        badgeId = 1;
        const data: GetBadgeDTO = { User: userId, Badges: badgeId };
        await this.badgeService.getBadge(data, queryRunner);
      }
    } else {
      status = 'recruit';
      if (groupCount === 0) {
        // 그룹 목표 첫 생성 뱃지 획득
        badgeId = 4;
        const data: GetBadgeDTO = { User: userId, Badges: badgeId };
        await this.badgeService.getBadge(data, queryRunner);
      }
    }
  }

  // 목표 참가 검증 로직 -> 참가
  async joinValidation(goalId: number, userId: number, accountId: number) {
    await this.checkRegister(goalId, userId);
    await this.checkGoal(accountId, goalId, userId);
  }

  // 이미 참가한 목표인지
  async checkRegister(goalId: number, userId: number) {
    const data = { goalId, userId };
    const checkRegister: UserGoals = await this.usergoalService.findUser(data);
    if (checkRegister) {
      throw new HttpException(
        '이미 참가한 목표입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 목표 검증 후 참가 수행
  async checkGoal(accountId: number, goalId: number, userId: number) {
    const findGoal = await this.getGoalByGoalId(goalId);
    if (!findGoal) {
      throw new HttpException(
        '존재하지 않는 목표입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // 검증 : 참가자가 꽉 찼을 경우
    const goalMaxUser: number = findGoal.headCount;
    if (findGoal.curCount === goalMaxUser) {
      // 에러 반환 - 참가 유저가 가득 찼습니다
      throw new HttpException('모집이 완료되었습니다.', HttpStatus.BAD_REQUEST);
    } else {
      // 참가 가능
      await this.joinGoal(accountId, userId, goalId, findGoal);
    }
  }

  async joinGoal(
    accountId: number,
    userId: number,
    goalId: number,
    findGoal: Goals,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.accountService.updateAccountAssignment(accountId, queryRunner);
      const balanceData: InitBalanceDTO = {
        initial: 0,
        current: 0,
        chkType: 'Direct Input',
      };
      const balanceCreate: Balances = await this.balanceService.initBalance(
        balanceData,
        queryRunner,
      );
      const balanceId: number = balanceCreate.balanceId;
      const status = 'pending';
      const createUserGoalData: CreateUserGoalDTO = {
        userId,
        goalId,
        accountId,
        balanceId,
        status,
      };
      await this.usergoalService.joinGoal(createUserGoalData, queryRunner);
      findGoal.curCount += 1;
      await this.updateGoalCurCount(goalId, findGoal.curCount, queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async searchConditionProcess(paginationQuery) {
    let { keyword, sortby, orderby, status, min, max, cursor, id } =
      paginationQuery;
    let sortOby = '';
    //sortBy가 비어있으면 생성 시간순으로 분류
    if (!sortby) sortOby = 'g.createdAt';
    else {
      switch (sortby) {
        // 정렬방식은 status - 진행중/모집중 - default: total
        // sortBy - 목표금액amount / 모집인원member / 목표기간period
        // orderBy - ASC(오름), DESC(내림)
        case 'amount':
          sortOby = 'g.amount';
          if (!max) max = 70000;
          break;
        case 'member':
          sortOby = 'g.headCount';
          if (!max) max = 10;
          break;
        case 'period':
          sortOby = 'g.period';
          if (!max) max = 7;
          break;
        default:
          sortOby = 'g.createdAt';
          break;
      }
    }
    if (!min) min = 0;
    if (!orderby) orderby = 'DESC';

    let statuses: string[];
    if (status === 'recruit') statuses = ['recruit'];
    else if (status === 'proceeding') statuses = ['proceeding'];
    else statuses = ['recruit', 'proceeding'];
    return { orderby, sortOby, keyword, statuses, min, max, cursor, id };
  }

  async searchGoalLogic(paginationQuery) {
    let { orderby, sortOby, keyword, statuses, min, max, cursor, id } =
      await this.searchConditionProcess(paginationQuery);
    // 1. 필터링
    const take = 5;
    let searchResult;
    let count: number;
    if (orderby === 'ASC' && !(sortOby === 'g.createdAt')) {
      [searchResult, count] = await this.searchGoal(
        keyword,
        sortOby,
        statuses,
        min,
        max,
        orderby,
        take,
        cursor,
        id,
      );
    } else if (orderby === 'DESC' && !(sortOby === 'g.createdAt')) {
      // orderBy 설정이 되어있지 않으면 기본적으로 내림차순
      [searchResult, count] = await this.searchGoal(
        keyword,
        sortOby,
        statuses,
        min,
        max,
        orderby,
        take,
        cursor,
        id,
      );
    } else {
      // sortby와 max 가 둘 다 없는 경우
      // sortby : createdAt / max : undefined
      [searchResult, count] = await this.searchGoalNotValue(
        keyword,
        sortOby,
        statuses,
        orderby,
        take,
        id,
      );
    }
    // 2. 데이터 가공
    const result = [];
    let newCursor;
    let length: number;
    if (searchResult.length === 6) length = 5;
    else length = searchResult.length;
    for (let i = 0; i < length; i++) {
      const { userId, nickname } = searchResult[i].userId;
      const hashTag = searchResult[i].hashTag.split(',');
      if (i === length - 1) {
        id = searchResult[i].goalId;
        switch (sortOby) {
          // 정렬방식은 status - 진행중/모집중 - default: total
          // sortBy - 목표금액amount / 모집인원member / 목표기간period
          // orderBy - ASC(오름), DESC(내림)
          case 'g.amount':
            newCursor = searchResult[i].amount;
            break;
          case 'g.headCount':
            newCursor = searchResult[i].headCount;
            break;
          case 'g.period':
            newCursor = searchResult[i].period;
            break;
          case 'g.createdAt':
            newCursor = searchResult[i].createdAt;
            break;
        }
      }
      result.push({
        goalId: searchResult[i].goalId,
        userId: userId,
        nickname: nickname,
        amount: searchResult[i].amount,
        curCount: searchResult[i].curCount,
        headCount: searchResult[i].headCount,
        startDate: searchResult[i].startDate,
        endDate: searchResult[i].endDate,
        period: searchResult[i].period,
        status: searchResult[i].status,
        title: searchResult[i].title,
        hashTag: hashTag,
        emoji: searchResult[i].emoji,
        description: searchResult[i].description,
        createdAt: searchResult[i].createdAt,
        updatedAt: searchResult[i].updatedAt,
      });
    }
    let isLastPage: boolean;
    if (count < take) isLastPage = true;
    else isLastPage = false;
    return { result, returnCursor: newCursor, goalId: id, isLastPage, count };
  }

  async getAllGoals(take: number, cursor: number): Promise<[Goals[], number]> {
    const query = await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', {
        statuses: ['recruit', 'proceeding'],
      })
      .andWhere('g.headCount != 1')
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname']);
    if (cursor) query.andWhere('g.goalId < :cursor', { cursor });
    const result = query
      .orderBy('g.createdAt', 'DESC')
      // 결과값이 5일 경우 다음 페이지가 존재하는지 검증 하기위해 6개씩 take
      .take(take + 1)
      .getManyAndCount();
    return result;
  }

  async getAllGoalDataProcess(cursor: number) {
    const take = 5;
    const [sortResult, count] = await this.getAllGoals(take, cursor);
    const result = [];
    let newCursor: number;
    let length: number;
    if (sortResult.length === 6) length = 5;
    else length = sortResult.length;
    for (let i = 0; i < length; i++) {
      const { userId, nickname } = sortResult[i].userId;
      const hashTag = sortResult[i].hashTag.split(',');
      if (i === length - 1) newCursor = sortResult[i].goalId;
      result.push({
        goalId: sortResult[i].goalId,
        userId: userId,
        nickname: nickname,
        amount: sortResult[i].amount,
        curCount: sortResult[i].curCount,
        headCount: sortResult[i].headCount,
        startDate: sortResult[i].startDate,
        endDate: sortResult[i].endDate,
        period: sortResult[i].period,
        status: sortResult[i].status,
        title: sortResult[i].title,
        hashTag: hashTag,
        emoji: sortResult[i].emoji,
        description: sortResult[i].description,
        createdAt: sortResult[i].createdAt,
        updatedAt: sortResult[i].updatedAt,
      });
    }
    let isLastPage: boolean;
    if (count < take) isLastPage = true;
    else isLastPage = false;
    return { result, returnCursor: newCursor, isLastPage };
  }

  async searchGoal(
    keyword: string,
    sortOby: string,
    statuses: string[],
    min: number,
    max: number,
    orderby: 'ASC' | 'DESC',
    take: number,
    cursor: number,
    id: number,
  ): Promise<[Goals[], number]> {
    const sortCondition = {};
    sortCondition[sortOby] = orderby;
    sortCondition['g.goalId'] = orderby;
    const query = await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', { statuses })
      .andWhere(`${sortOby} BETWEEN ${min} AND ${max}`)
      .andWhere('g.headCount != 1')
      .andWhere(
        new Brackets((qb) => {
          qb.where('g.title like :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('g.hashTag like :keyword', { keyword: `%${keyword}%` });
        }),
      )
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy(sortCondition);
    if (cursor) {
      if (orderby === 'DESC') {
        query.andWhere(
          new Brackets((qb) => {
            qb.where(`${sortOby} = :cursor AND g.goalId < :id`, {
              cursor,
              id,
            }).orWhere(`${sortOby} < :cursor`, { cursor });
          }),
        );
      } else {
        // ASC
        query.andWhere(
          new Brackets((qb) => {
            qb.where(`${sortOby} = :cursor AND g.goalId > :id`, {
              cursor,
              id,
            }).orWhere(`${sortOby} > :cursor`, { sortOby, cursor });
          }),
        );
      }
    }
    const result = await query.take(take + 1).getManyAndCount();
    return result;
  }

  async searchGoalNotValue(
    keyword: string,
    sortOby: string,
    statuses: string[],
    orderby: 'ASC' | 'DESC',
    take: number,
    id: number,
  ): Promise<[Goals[], number]> {
    const query = await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', { statuses })
      .andWhere('g.headCount != 1')
      .andWhere(
        new Brackets((qb) => {
          qb.where('g.title like :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('g.hashTag like :keyword', { keyword: `%${keyword}%` });
        }),
      )
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy(`${sortOby}`, `${orderby}`);
    if (id) {
      if (orderby === 'DESC') query.andWhere(`g.goalId < :id`, { id });
      else query.andWhere(`g.goalId > :id`, { id });
    }
    const result = query.take(take + 1).getManyAndCount();
    return result;
  }

  async getImminentGoal(take: number, status: string): Promise<Goals[]> {
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status = :status', { status })
      .andWhere('g.curcount != g.headcount')
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy('g.startDate', 'ASC')
      .take(take)
      .getMany();
  }

  async ImminentGoalDataProcess() {
    const take = 10;
    const status = 'recruit';
    const sortResult = await this.getImminentGoal(take, status);
    const result = [];
    for (let i = 0; i < sortResult.length; i++) {
      const { userId, nickname } = sortResult[i].userId;
      const hashTag = sortResult[i].hashTag.split(',');
      result.push({
        goalId: sortResult[i].goalId,
        userId: userId,
        nickname: nickname,
        amount: sortResult[i].amount,
        curCount: sortResult[i].curCount,
        headCount: sortResult[i].headCount,
        startDate: sortResult[i].startDate,
        endDate: sortResult[i].endDate,
        period: sortResult[i].period,
        status: sortResult[i].status,
        title: sortResult[i].title,
        hashTag: hashTag,
        emoji: sortResult[i].emoji,
        description: sortResult[i].description,
        createdAt: sortResult[i].createdAt,
        updatedAt: sortResult[i].updatedAt,
      });
    }
    return result;
  }

  async getGoalDetail(goalId: number): Promise<Goals> {
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.goalId = :goalId', { goalId })
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .getOne();
  }

  async goalDetailLogic(goalId: number, myUserId: number) {
    const findGoal = await this.getGoalDetail(goalId);
    if (!findGoal) {
      throw new HttpException('존재하지 않는 목표입니다', HttpStatus.NOT_FOUND);
    }
    if (findGoal.status === 'denied') {
      throw new HttpException(
        '정지 처리된 게시물입니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    const joinUser = await this.usergoalService.getJoinUser(goalId);
    const member = [];
    for (let i = 0; i < joinUser.length; i++) {
      const {
        userId: memberUserId,
        nickname: memberNickname,
        image: memberImage,
      } = joinUser[i].userId;
      const { balanceId, current } = joinUser[i].balanceId;
      const { accountId } = joinUser[i].accountId;
      let attainment = 0;
      if (current !== 0) {
        attainment = (current / findGoal.amount) * 100;
      }
      if (myUserId === memberUserId) {
        member.push({
          userId: memberUserId,
          nickname: memberNickname,
          image: memberImage,
          attainment,
          accountId,
          balanceId,
        });
      } else {
        member.push({
          userId: memberUserId,
          nickname: memberNickname,
          image: memberImage,
          attainment,
        });
      }
    }

    const { userId, nickname } = findGoal.userId;
    const hashTag = findGoal.hashTag.split(',');
    const result = [];
    result.push({
      goalId: findGoal.goalId,
      isPrivate: findGoal.isPrivate,
      userId: userId,
      nickname: nickname,
      amount: findGoal.amount,
      curCount: findGoal.curCount,
      headCount: findGoal.headCount,
      startDate: findGoal.startDate,
      endDate: findGoal.endDate,
      period: findGoal.period,
      status: findGoal.status,
      title: findGoal.title,
      hashTag: hashTag,
      emoji: findGoal.emoji,
      description: findGoal.description,
      createdAt: findGoal.createdAt,
      updatedAt: findGoal.updatedAt,
      members: member,
    });
    return result;
  }

  async getGoalByGoalId(goalId: number): Promise<Goals> {
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.goalId = :goalId', { goalId })
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId'])
      .getOne();
  }

  async getStartGoalByStatus(
    status: string,
    aDate: string,
    bDate: string,
  ): Promise<Goals[]> {
    return await this.goalRepository.find({
      where: { status, startDate: Between(new Date(aDate), new Date(bDate)) },
    });
  }

  async getEndGoalByStatus(
    status: string,
    aDate: string,
    bDate: string,
  ): Promise<Goals[]> {
    return await this.goalRepository.find({
      where: { status, endDate: Between(new Date(aDate), new Date(bDate)) },
    });
  }

  // 목표 참가자 숫자 변화
  async updateGoalCurCount(
    goalId: number,
    curCount: number,
    queryRunner: QueryRunner,
  ) {
    await queryRunner.manager.update(Goals, { goalId }, { curCount });
  }

  async exitGoalLogic(goalId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // getGoalDetail 가져오기
      const findGoal = await this.getGoalByGoalId(goalId);
      if (userId === findGoal.userId.userId) {
        // if 개설자 본인일 경우 에러 리턴
        throw new HttpException(
          '접근할 수 없는 권한입니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
      // 1. 참가한 유저인지 확인
      const accessUserGoalData: AccessUserGoalDTO = { userId, goalId };
      const find = await this.usergoalService.findUser(accessUserGoalData);
      if (find == null) {
        // error - 참가하지 않은 유저입니다.
        throw new HttpException('참가하지 않았습니다.', HttpStatus.BAD_REQUEST);
      } else {
        // 중간 테이블 삭제
        await this.usergoalService.exitGoal(accessUserGoalData, queryRunner);
        // 참가자 숫자 변동
        findGoal.curCount -= 1;
        await this.updateGoalCurCount(goalId, findGoal.curCount, queryRunner);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updateGoal(goalId: number, data: UpdateGoalDTO) {
    await this.goalRepository.update({ goalId }, data);
  }

  async updateGoalLogic(
    userId: number,
    inputUpdateGoalDTO: InputUpdateGoalDTO,
    goalId: number,
  ) {
    const findGoal = await this.getGoalByGoalId(goalId);
    if (userId != findGoal.userId.userId) {
      throw new HttpException(
        '접근할 수 없는 권한입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    let hashTag = '';
    for (let i = 0; i < inputUpdateGoalDTO.hashTag.length; i++) {
      if (i == inputUpdateGoalDTO.hashTag.length - 1) {
        hashTag += inputUpdateGoalDTO.hashTag[i];
      } else {
        hashTag += inputUpdateGoalDTO.hashTag[i] + ',';
      }
    }
    let isPrivate = false;
    if (inputUpdateGoalDTO.isPrivate) {
      isPrivate = inputUpdateGoalDTO.isPrivate;
    }
    const data: UpdateGoalDTO = {
      isPrivate: isPrivate,
      title: inputUpdateGoalDTO.title,
      description: inputUpdateGoalDTO.description,
      amount: inputUpdateGoalDTO.amount,
      startDate: new Date(inputUpdateGoalDTO.startDate),
      endDate: new Date(inputUpdateGoalDTO.endDate),
      hashTag: hashTag,
      emoji: inputUpdateGoalDTO.emoji,
      headCount: inputUpdateGoalDTO.headCount,
    };
    await this.updateGoal(goalId, data);
  }

  // 목표 시작, 완료 시 호출
  async goalUpdateStatus(
    goalId: number,
    status: string,
    queryRunner: QueryRunner,
  ) {
    await queryRunner.manager.update(Goals, { goalId }, { status });
  }

  // 목표 삭제
  async deleteGoal(goalId: number, queryRunner: QueryRunner) {
    await queryRunner.manager.remove({ goalId });
  }

  async deleteGoalLogic(goalId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const find = await this.getGoalDetail(goalId);
      if (userId != find.userId.userId) {
        throw new HttpException('삭제 권한이 없습니다.', 400);
      }
      // 참가자가 2명이상이면 삭제 불가능
      if (find.curCount >= 2) {
        throw new HttpException('참가한 유저가 있어 삭제가 불가능합니다.', 400);
      } else {
        const accessUserGoalData: AccessUserGoalDTO = { userId, goalId };
        await this.usergoalService.exitGoal(accessUserGoalData, queryRunner);
        await this.deleteGoal(goalId, queryRunner);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // 신고로 인한 삭제시 status만 변경하여 검색에서 제외됨
  async denyGoal(goalId: number) {
    const status: string = 'denied';
    return await this.goalRepository.update({ goalId }, { status });
  }
}
