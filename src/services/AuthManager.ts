import jwt from 'jsonwebtoken';
import { UserEntity } from '../entities/UserEntity'
import { AccessToken } from '../models/AccessToken';

export class AuthManager {

    static createAccessToken(user: UserEntity): AccessToken {
        const accessToken: AccessToken = new AccessToken(user.id || 0, user.role);
        return accessToken;
    }

    static createJwtAccessToken(accessToken: AccessToken): string {
        const jwtToken = jwt.sign({accessToken}, process.env.JWT_SECRET_KEY!, {expiresIn: process.env.JWT_TOKEN_EXPIRATION_TIME});
        return jwtToken;
    }

    static createJwtRefreshToken(user: UserEntity): string {
        const accessToken = new AccessToken(user.id || 0, user.role);
        const jwtToken = jwt.sign({accessToken}, process.env.JWT_REFRESH_TOKEN_SECRET_KEY!, {expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME});
        return jwtToken;
    }

}