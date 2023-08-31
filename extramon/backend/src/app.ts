import express, { Request, Response } from 'express';
import mysql, {RowDataPacket} from 'mysql2/promise';
import crypto from 'crypto';

import cors from 'cors';

import 'dotenv/config';

const app = express();

app.use(express.json());

import settingsRouter from './settings';
app.options('/settings', verifyToken, );
app.use('/settings', verifyToken, settingsRouter);

const port = 9030;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
