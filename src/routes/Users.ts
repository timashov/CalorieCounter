import express, { Request, Response } from 'express';
import { BadRequestError } from '../errors/BadRequestError';
import { UserRole } from '../models/UserRole';
import { validateAccessToken } from '../middlewares/ValidateJWT';
import { PermissionError } from '../errors/PermissionError';
import { PageToken } from '../models/PageToken';
import { UserEntity } from '../entities/UserEntity';
import { CaloriesRecordEntity } from '../entities/CaloriesRecordEntity';
import { getRepository } from 'typeorm';

const router = express.Router();

router.delete(
    '/api/v1/users/:userId', 
    validateAccessToken([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER]),
    async (req: Request, res: Response) => {
        const userId = +req.params.userId;

        if (req.userAccessToken.role != UserRole.ADMIN && req.userAccessToken.role != UserRole.MANAGER && req.userAccessToken.userId != userId){
            throw new PermissionError();
        }

        const user = await UserEntity.findOne(userId);
        if (!user){
            throw new BadRequestError('User does\'t exist');
        }    
        await user.remove();
        
        await getRepository(CaloriesRecordEntity)
            .createQueryBuilder("record")
            .delete()
            .where(`userId = :userId`, { userId: userId })
            .execute();

        res.status(200).send({});
    }
);

router.get(
    '/api/v1/users/:userId', 
    validateAccessToken([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER]),
    async (req: Request, res: Response) => {
        const userId = +req.params.userId;

        if (req.userAccessToken.role != UserRole.ADMIN && req.userAccessToken.role != UserRole.MANAGER && req.userAccessToken.userId != userId){
            throw new PermissionError();
        }

        const user = await UserEntity.findOne(userId);
        if (!user){
            throw new BadRequestError('User does\'t exist');
        }    

        const response = {
            user: user
        }

        res.status(200).send(response);
    }
);

router.put(
    '/api/v1/users/:userId', 
    validateAccessToken([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER]),
    async (req: Request, res: Response) => {
        const userId = +req.params.userId;
        const { name } = req.body;

        if (req.userAccessToken.role != UserRole.ADMIN && req.userAccessToken.role != UserRole.MANAGER && req.userAccessToken.userId != userId){
            throw new PermissionError();
        }
        
        const user = await UserEntity.findOne(userId);
        if (!user){
            throw new BadRequestError('User does\'t exist');
        }

        if (name != undefined){ user.name = name; }
        await user.save();

        const response = {
            user: user
        }

        res.status(200).send(response);
    }
);

router.get(
    '/api/v1/users', 
    validateAccessToken([UserRole.ADMIN, UserRole.MANAGER]),
    async (req: Request, res: Response) => {
        const pageToken = PageToken.parse(req.query?.pageToken?.toString());
        let filter = req.body.filter;

        let pageIndex = (pageToken!=undefined) ? (pageToken.pageIndex+1) : 0;
        let pageSize = (pageToken!=undefined) ? pageToken.pageSize : 10;

        let whereQuery = '';
        if (filter != undefined){
            // maybe we can allow filters without 'eq', 'ne' etc? and allow to write '=', '!=' directly 
            filter = filter.replace(/ eq /g, ' = ');
            filter = filter.replace(/ ne /g, ' != ');
            filter = filter.replace(/ gt /g, ' > ');
            filter = filter.replace(/ lt /g, ' < ');

            if (whereQuery != '') { whereQuery += ' AND '; }
            whereQuery += '(' + filter + ')';
        }
        
        const [users, usersCount] = await UserEntity.findAndCount({ where: whereQuery, take: pageSize, skip: pageSize*pageIndex });

        const hasMore = (usersCount > pageSize*(pageIndex+1));
        const newPageToken: PageToken = new PageToken(pageIndex, pageSize);

        const response = {
            hasMore: hasMore,
            pageToken: newPageToken,
            usersCount: usersCount,
            users: users
        };

        res.status(200).send(response);
    }
);

export { router as usersRouter };