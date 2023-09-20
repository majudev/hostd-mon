import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken';
import {v4 as uuidv4} from 'uuid';
import { JWT_EXPIRATION_DAYS, JWT_SECRET } from './jwt_secret';
import { randomBytes } from 'crypto';
  
import { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } from 'simple-oauth2';

const router = Router();
const prisma = new PrismaClient();

interface RegisterUserRequest {
    email: string;
};

interface LoginUserRequest {
    email: string;
};

const client = new AuthorizationCode({
    client: {
        id: process.env.OAUTH_GOOGLE_ID as string,
        secret: process.env.OAUTH_GOOGLE_SECRET as string,
    },
    auth: {
        tokenHost: 'https://oauth2.googleapis.com',
        tokenPath: '/token',
        authorizeHost: 'https://accounts.google.com',
        authorizePath: '/o/oauth2/v2/auth',
    },
});

router.get('/google', async (req: Request, res: Response) => {
    const authorizationUri = client.authorizeURL({
        redirect_uri: process.env.OAUTH_GOOGLE_CALLBACK,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        state: randomBytes(16).toString('hex'),
    });

    res.redirect(authorizationUri);
});

router.get('/google/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    const options = {
        redirect_uri: process.env.OAUTH_GOOGLE_CALLBACK as string,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        code: code as string,
    };

    try {
      const accessToken = await client.getToken(options);

      console.log('The resulting token: ', accessToken.token);

      return res.status(200).json(accessToken.token);
    } catch (error: any) {
      console.error('Access Token Error', error.message);
      return res.status(500).json('Authentication failed');
    }
});

router.post('/register', async (req: Request, res: Response) => {
    const request: RegisterUserRequest = req.body;

    if(request.email === undefined) {
        res.status(400).json({
            status: "error",
            message: "please provide an email",
        });
        return;
    }

    const exists = await prisma.user.count({
        where: {
            email: request.email,
        }
    }) > 0;

    if(exists) {
        res.status(409).json({
            status: "error",
            message: "user with this email already exists",
        });
        return;
    }

    await prisma.user.create({
        data: {
            email: request.email,
            name: null,
        },
    });

	res.status(201).json({
		status: "success",
        data: null,
	});
});

router.post('/login', async (req: Request, res: Response) => {
    const request: LoginUserRequest = req.body;

    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            email: true,
            admin: true,
        },
        where: {
            email: request.email,
        }
    });

    const exists = (userObject !== null);

    if(!exists) {
        res.status(401).json({
            status: "error",
            message: "user with this email does not exist",
        });
        return;
    }

    var authToken = await jwt.sign({
        id: uuidv4(),
        userId: userObject.id,
        email: userObject.email,
        admin: userObject.admin,
    }, await JWT_SECRET(), {
        expiresIn: (await JWT_EXPIRATION_DAYS()) + "d",
    });

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + Number.parseInt(await JWT_EXPIRATION_DAYS()));
    res.cookie("SIAWATCH_COOKIE", authToken, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        expires: expirationDate,
    });

	res.status(200).json({
		status: "success",
        data: userObject,
	});
});

export default router;
