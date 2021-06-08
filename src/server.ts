import express from 'express';
import cors from 'cors';

import { json } from 'body-parser';
import { createConnection } from 'typeorm';

import 'reflect-metadata';
import 'express-async-errors';
import './services/Secrets'

import { authRouter } from './routes/Auth';
import { usersRouter } from './routes/Users';
import { recordsRouter } from './routes/Records';

import { AccessToken } from './models/AccessToken';
import { NotFoundError } from './errors/NotFoundError';
import { errorHandler } from './middlewares/ErrorHandler';

declare global {
    namespace Express {
      interface Request {
        userAccessToken: AccessToken
      }
    }
}

export const app = express();
app.use(json());
app.use(cors());

app.use(authRouter);
app.use(usersRouter);
app.use(recordsRouter);

app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler);