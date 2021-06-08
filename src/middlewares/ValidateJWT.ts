import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PermissionError } from '../errors/PermissionError';
import { JWTAccessToken } from '../models/AccessToken';
import { UserRole } from '../models/UserRole';

export function validateAccessToken(acceptRoles?: UserRole[]) {
    return function(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const tokenString = (req.headers.authorization || '').split(' ')[1] || '';
        if (tokenString === ''){ 
            next(new PermissionError()); 
            return;
        }

        if (acceptRoles && acceptRoles.length>0){
            try {
                if (process.env.JWT_SECRET_KEY){
                    const decodedToken = jwt.verify(tokenString, process.env.JWT_SECRET_KEY!) as JWTAccessToken;
                    const userAccessToken = decodedToken.accessToken;

                    req.userAccessToken = userAccessToken;

                    if (acceptRoles.includes(userAccessToken.role)){
                        next();
                        return;
                    }
                }
                else{
                    console.error('JWT_SECRET_KEY is not set');
                    next(new PermissionError());
                    return;
                }
            } catch(err) {
                if (err.name === 'TokenExpiredError' || (err.name === 'UnauthorizedError' && err.message === 'jwt expired')){
                    // throw only if it's jwt expired error
                    next(err);
                    return;
                }
            }
        }

        // don't have any of these permissions
        next(new PermissionError());

    }
};

export const validateRefreshToken = (
        req: Request,
        res: Response,
        next: NextFunction
) => {
    const tokenString = (req.headers.authorization || '').split(' ')[1] || '';
    if (tokenString === ''){ 
        next(new PermissionError()); 
        return;
    }

    try {
        if (process.env.JWT_REFRESH_TOKEN_SECRET_KEY){
            const decodedToken = jwt.verify(tokenString, process.env.JWT_REFRESH_TOKEN_SECRET_KEY!) as JWTAccessToken;
            req.userAccessToken = decodedToken.accessToken;

            jwt.verify(tokenString, process.env.JWT_REFRESH_TOKEN_SECRET_KEY!);
            next();
            return;
        }
        else{
            console.error('JWT_REFRESH_TOKEN_SECRET_KEY is not set');
        }
    } catch(err) {
        if (err.name === 'TokenExpiredError' || (err.name === 'UnauthorizedError' && err.message === 'jwt expired')){
            // throw only if it's jwt expired error
            next(err);
            return;
        }
    }

    next(new PermissionError());
};