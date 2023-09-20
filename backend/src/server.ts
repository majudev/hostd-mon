import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes';
import requestLogger from './utils/requestLogger';
import cookieMonster from './utils/cookieMonster';

const app = express();

/* basic express config */
app.use(express.json());
app.use(cookieParser());

/* custom middlewares */
app.use(cookieMonster);
app.use(requestLogger);

/* main router */
app.use('/', router);

/* 404 Not Found handler */
app.use('*', (req, res) => res.status(404).json({
    status: "error",
    message: "endpoint not found",
}));

export default app;
