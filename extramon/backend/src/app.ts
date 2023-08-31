import express, { Request, Response } from 'express';

import 'dotenv/config';

const app = express();

app.use(express.json());

import clientRouter from './client';
app.options('/client');
app.use('/client', clientRouter);

import masterRouter from './master';
app.options('/master');
app.use('/master', masterRouter);

const port = 9030;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
