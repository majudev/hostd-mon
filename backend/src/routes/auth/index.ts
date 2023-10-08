import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken';
import {v4 as uuidv4} from 'uuid';
import { JWT_EXPIRATION_DAYS, JWT_SECRET } from './jwt_secret';
import { randomBytes } from 'crypto';
import { fail_internal_error } from '../../utils/http_code_helper';
  
import { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } from 'simple-oauth2';

const router = Router();
const prisma = new PrismaClient();

const google = new AuthorizationCode({
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
    const authorizationUri = google.authorizeURL({
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
        const accessToken = await google.getToken(options);

        //console.log('The resulting token: ', accessToken.token);

        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + encodeURIComponent(accessToken.token.access_token as string),{
            method: "GET",
        });
        const status = response.status;
        if(status !== 200){
            /*res.status(401).json({
                status: "error",
                message: "invalid OAuth2 code provided",
            }).end();*/
            res.redirect((process.env.LOGIN_SUCCESSFUL_CALLBACK as string) + '?status=error&code=401&message=invalid+OAuth2+code+provided');
            return;
        }
        const body = await response.json();
        const email = body.email;
        const name = body.name;

        if(email === undefined || email === null || name === undefined || name === null){
            //fail_internal_error(res, "google returned unsupported reply");
            res.redirect((process.env.LOGIN_SUCCESSFUL_CALLBACK as string) + '?status=error&code=500&message=google+provided+unsupported+reply');
        }
        await loginUser(req, res, email, name);
        //res.redirect((process.env.LOGIN_SUCCESSFUL_CALLBACK as string) + '?status=success');
        res.set('Content-Type', 'text/html');
        res.send(Buffer.from('<html><head><META http-equiv="refresh" content="0;' + (process.env.LOGIN_SUCCESSFUL_CALLBACK as string) + '?status=success"></head></html>'));
    } catch (error: any) {
      //fail_internal_error(res, "authentication failed");
      res.redirect((process.env.LOGIN_SUCCESSFUL_CALLBACK as string) + '?status=error&code=401&message=authentication+failed');
      return;
    }
});

async function loginUser(req: Request, res: Response, email: string, name: string){
    var userObject = await prisma.user.findFirst({
        select: {
            id: true,
            email: true,
            admin: true,
        },
        where: {
            email: email,
        }
    });

    if(userObject === null) {
        userObject = await prisma.user.create({
            data: {
                email: email,
                name: name,
            },
        });
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
        //secure: true,
        httpOnly: true,
        //sameSite: "strict",
        //sameSite: "lax",
        sameSite: "none",
        expires: expirationDate,
    });

    return userObject;
}

/// TODO: Delete this endpoint
/*router.post('/register', async (req: Request, res: Response) => {
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
});*/

/// TODO: delete this endpoint
/*router.post('/login', async (req: Request, res: Response) => {
//    const request: LoginUserRequest = req.body;

    const userObject = loginUser(req, res, req.body.email, req.body.email);
    res.status(200).json({
		status: "success",
        data: userObject,
	});
});*/

export default router;
