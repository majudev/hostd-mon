import config from '../config';
import {NextFunction, Response, Request} from 'express';
import logger from '../utils/logger';

/**
 * HTTP request logger - express middleware.
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	if (!config.LOGGER.LOG_HTTP_REQUESTS) {
		return next();
	}

	logger.debug(req.method + ' ' + req.originalUrl);

	next();
};

export default requestLogger;
