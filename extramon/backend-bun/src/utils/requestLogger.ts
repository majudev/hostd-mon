import {NextFunction, Response, Request} from 'express';
import logger from '../utils/logger';

/**
 * HTTP request logger - express middleware.
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	logger.info(req.method + ' ' + req.originalUrl);

	next();
};

export default requestLogger;
