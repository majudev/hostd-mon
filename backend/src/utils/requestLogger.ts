import {NextFunction, Response, Request} from 'express';
import logger from './logger';

/**
 * HTTP request logger - express middleware.
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const ip = req.header('CF-Connecting-IP') ?? req.ip
	const authenticated = res.locals.authenticated ? 'A' : 'U';

	logger.info('[' + ip + '-' + authenticated + '] ' + req.method + ' ' + req.originalUrl);

	next();
};

export default requestLogger;
