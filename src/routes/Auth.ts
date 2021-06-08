import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { UserEntity } from '../entities/UserEntity';
import { PasswordManager } from '../services/PasswordManager';
import { AuthManager } from '../services/AuthManager';
import { validateRequest } from '../middlewares/ValidateRequest';
import { BadRequestError } from '../errors/BadRequestError';
import { NotAuthorizedError } from '../errors/NotAuthorizedError';
import { UserRole } from '../models/UserRole';
import { validateRefreshToken } from '../middlewares/ValidateJWT';

const router = express.Router();

router.post(
    '/api/v1/auth/signup', 
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 8, max: 128 })
            .withMessage('Password must have more than 8 characters'),
        body('name')
            .trim()
            .isLength({ min: 4, max: 100 })
            .withMessage('Name must be between 4 and 100 characters'),
        body('role')
            .isIn([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER])
            .withMessage('Role is unsupported')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password, name, role } = req.body;

        const existingUser = await UserEntity.findOne({ email: email });

        if (existingUser){
            throw new BadRequestError('Email is used', 'email');
        }

        const user = new UserEntity();
        user.email = email;
        user.password = password;
        user.name = name;
        user.role = role;
        await user.save();

        const accessToken = AuthManager.createAccessToken(user);
        const jwtAccessToken = AuthManager.createJwtAccessToken(accessToken);
        const jwtRefreshToken = AuthManager.createJwtRefreshToken(user);

        const response = {
            accessToken: jwtAccessToken,
            refreshToken: jwtRefreshToken,
            user: user 
        };

        res.status(201).send(response);
    }
);

router.post(
    '/api/v1/auth/signin', 
    [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Invalid credentials: email'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Invalid credentials: password')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        let user = await UserEntity.findOne({ email: email });

        if (!user || !user.password){
            throw new BadRequestError('Invalid credentials');
        }

        const isPasswordCorrect = await PasswordManager.compare(user.password, password);
        if (!isPasswordCorrect) {
            throw new BadRequestError('Invalid credentials');
        }

        const accessToken = AuthManager.createAccessToken(user);
        const jwtAccessToken = AuthManager.createJwtAccessToken(accessToken);
        const jwtRefreshToken = AuthManager.createJwtRefreshToken(user);

        const response = {
            accessToken: jwtAccessToken,
            refreshToken: jwtRefreshToken,
            user: user 
        };

        res.status(200).send(response);
    }
);

router.get(
    '/api/v1/auth/refreshToken',
    validateRefreshToken,
    async (req: Request, res: Response) => {
        console.log('refreshToken');

        const reqAccessToken = req.userAccessToken;
        if (!reqAccessToken){ throw new NotAuthorizedError(); }

        console.log(reqAccessToken);

        const user = await UserEntity.findOne(reqAccessToken.userId);

        if (!user){
            throw new BadRequestError('User does\'t exist');
        }

        const accessToken = AuthManager.createAccessToken(user);
        const jwtAccessToken = AuthManager.createJwtAccessToken(accessToken);
        const jwtRefreshToken = AuthManager.createJwtRefreshToken(user);

        const response = {
            accessToken: jwtAccessToken,
            refreshToken: jwtRefreshToken
        };

        res.status(200).send(response);
    }
);

export { router as authRouter };