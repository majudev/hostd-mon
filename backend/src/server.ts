import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes';
import requestLogger from './utils/requestLogger';

const app = express();

/* cross-origin resource sharing config */
/*app.use(cors({
	//origin: 'sia.watch',
	credentials: true
}));*/

/* basic express config */
app.use(express.json());
app.use(cookieParser());

/* custom middlewares */
app.use(requestLogger);

/* main router */
app.use('/', router);

/* 404 Not Found handler */
app.get('*', (req, res) => res.status(404).send('<h1>404 Not Found</h1>'));

export default app;
