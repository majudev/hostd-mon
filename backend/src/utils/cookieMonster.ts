import {NextFunction, Response, Request} from 'express';
import logger from './logger';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../routes/auth/jwt_secret';

interface UserAuthObject {
    userId: number;
    email: string;
    admin: boolean;
}

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.SIAWATCH_COOKIE;

    if (!token) {
        res.locals.authenticated = false;
		res.locals.auth_error = 'no token';
		return next();
    }
    try {
        const decoded = jwt.verify(token, await JWT_SECRET());
        res.locals.authenticated = true;
		res.locals.auth_id = (decoded as { id: string; }).id;
		res.locals.auth_user = (decoded as UserAuthObject);
    } catch (err) {
        res.locals.authenticated = false;
		res.locals.auth_error = 'invalid token';
    }
    return next();
};

export default authenticate;
