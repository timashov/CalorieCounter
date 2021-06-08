import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/ValidateRequest';
import { BadRequestError } from '../errors/BadRequestError';
import { UserRole } from '../models/UserRole';
import { validateAccessToken } from '../middlewares/ValidateJWT';
import { CaloriesRecordEntity } from '../entities/CaloriesRecordEntity';
import { PermissionError } from '../errors/PermissionError';
import { PageToken } from '../models/PageToken';
import { CaloriesManager } from '../services/CaloriesManager';
import { UsersManager } from '../services/UsersManager';
import { RecordsManager } from '../services/RecordsManager';

const router = express.Router();

router.post(
    '/api/v1/records', 
    [
        body('date')
            .trim()
            .notEmpty()
            .withMessage('Date is required'),
        body('time')
            .trim()
            .notEmpty()
            .withMessage('Time is required'),
        body('text')
            .trim()
            .notEmpty()
            .withMessage('Text is required')
    ],
    validateRequest,
    validateAccessToken([UserRole.ADMIN, UserRole.USER]),
    async (req: Request, res: Response) => {
        const { date, time, text } = req.body;
        let { caloriesCount } = req.body;
        
        const userId = req.userAccessToken.userId;

        if (caloriesCount == undefined){
            caloriesCount = await CaloriesManager.getCaloriesCount(text);
        }

        const record = new CaloriesRecordEntity(userId, date, time, text, caloriesCount);
        await record.save();

        const dailyCaloriesCount = await UsersManager.calculateUserDailyCalories(userId);
        await RecordsManager.updateDateCaloriesCount(userId, date);
        await RecordsManager.calculateDailyCaloriesQuotaExcess(userId, dailyCaloriesCount);

        const response = {
            record: record
        };

        res.status(201).send(response);
    }
);

router.delete(
    '/api/v1/records/:recordId', 
    validateAccessToken([UserRole.ADMIN, UserRole.USER]),
    async (req: Request, res: Response) => {
        const recordId = +req.params.recordId;
        const userId = req.userAccessToken.userId;
        
        const record = await CaloriesRecordEntity.findOne(recordId);

        if (!record){
            throw new BadRequestError('Record does\'t exist');
        }

        if (req.userAccessToken.role != UserRole.ADMIN && req.userAccessToken.userId != record.userId){
            throw new PermissionError();
        }

        const recordUserId = record.userId;
        const recordDate = record.date;

        await record.remove();

        if (recordUserId && recordDate){
            const dailyCaloriesCount = await UsersManager.calculateUserDailyCalories(recordUserId);
            await RecordsManager.updateDateCaloriesCount(recordUserId, recordDate);
            await RecordsManager.calculateDailyCaloriesQuotaExcess(recordUserId, dailyCaloriesCount);
        }

        res.status(200).send({});
    }
);

router.get(
    '/api/v1/records/:recordId', 
    validateAccessToken([UserRole.ADMIN, UserRole.USER]),
    async (req: Request, res: Response) => {
        const recordId = +req.params.recordId;
        const userId = req.userAccessToken.userId;
        
        const record = await CaloriesRecordEntity.findOne(recordId);

        if (!record){
            throw new BadRequestError('Record does\'t exist');
        }

        if (req.userAccessToken.role != UserRole.ADMIN && req.userAccessToken.userId != record.userId){
            throw new PermissionError();
        }

        const response = {
            record: record
        }

        res.status(200).send(response);
    }
);

router.put(
    '/api/v1/records/:recordId', 
    validateAccessToken([UserRole.ADMIN, UserRole.USER]),
    async (req: Request, res: Response) => {
        const recordId = +req.params.recordId;
        const userId = req.userAccessToken.userId;
        const { date, time, text, caloriesCount } = req.body;
        
        const record = await CaloriesRecordEntity.findOne(recordId);

        if (!record){
            throw new BadRequestError('Record does\'t exist');
        }

        if (req.userAccessToken.role != UserRole.ADMIN && req.userAccessToken.userId != record.userId){
            throw new PermissionError();
        }

        const oldDate = record.date;

        if (date != undefined){ record.date = date; }
        if (time != undefined){ record.time = time; }
        if (caloriesCount != undefined){ record.caloriesCount = caloriesCount; }
        if (text != undefined){ 
            record.text = text;
            //TODO: maybe we should re-calc calories count?
        }

        await record.save();

        if (date != undefined || caloriesCount != undefined){
            const dailyCaloriesCount = await UsersManager.calculateUserDailyCalories(userId);

            await RecordsManager.updateDateCaloriesCount(userId, date);

            if (oldDate != undefined && oldDate != date){
                await RecordsManager.updateDateCaloriesCount(userId, oldDate);
            }

            await RecordsManager.calculateDailyCaloriesQuotaExcess(userId, dailyCaloriesCount);
        }

        const response = {
            record: record
        }

        res.status(200).send(response);
    }
);

router.get(
    '/api/v1/records', 
    validateAccessToken([UserRole.ADMIN, UserRole.USER]),
    async (req: Request, res: Response) => {
        const recordId = +req.params.recordId;
        const userId = req.userAccessToken.userId;
        let filter = req.body.filter;
        
        const pageToken = PageToken.parse(req.query?.pageToken?.toString());

        let pageIndex = (pageToken!=undefined) ? (pageToken.pageIndex+1) : 0;
        let pageSize = (pageToken!=undefined) ? pageToken.pageSize : 10;

        let whereQuery = '';
        if (req.userAccessToken.role != UserRole.ADMIN){
            whereQuery = `userId = ${req.userAccessToken.userId}`;
        }

        if (filter != undefined){
            // maybe we can allow filters without 'eq', 'ne' etc? and allow to write '=', '!=' directly 
            filter = filter.replace(/ eq /g, ' = ');
            filter = filter.replace(/ ne /g, ' != ');
            filter = filter.replace(/ gt /g, ' > ');
            filter = filter.replace(/ lt /g, ' < ');

            if (whereQuery != '') { whereQuery += ' AND '; }
            whereQuery += '(' + filter + ')';
        }

        const [records, recordsCount] = await CaloriesRecordEntity.findAndCount({ where: whereQuery, take: pageSize, skip: pageSize*pageIndex });

        const hasMore = (recordsCount > pageSize*(pageIndex+1));
        const newPageToken: PageToken = new PageToken(pageIndex, pageSize);

        const response = {
            hasMore: hasMore,
            pageToken: newPageToken,
            recordsCount: recordsCount,
            records: records
        };

        res.status(200).send(response);
    }
);

export { router as recordsRouter };