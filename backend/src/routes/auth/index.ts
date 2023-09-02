import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'

const router = Router();
const prisma = new PrismaClient();

interface RegisterUserRequest {
    email: string;
};

interface LoginUserRequest {
    email: string;
};

router.post('/register', async (req: Request, res: Response) => {
    const request: RegisterUserRequest = req.body;

    if(request.email === undefined) {
        res.json({
            status: "error",
            message: "please provide an email",
        }).status(400);
        return;
    }

    const exists = await prisma.user.count({
        where: {
            email: request.email,
        }
    }) > 0;

    if(exists) {
        res.json({
            status: "error",
            message: "user with this email already exists",
        }).status(409);
        return;
    }

    await prisma.user.create({
        data: {
            email: request.email,
            name: null,
        },
    });

	res.json({
		status: "success",
	}).status(201);
});

router.post('/login', async (req: Request, res: Response) => {
    const request: LoginUserRequest = req.body;

    const exists = await prisma.user.count({
        where: {
            email: request.email,
        }
    }) > 0;

    if(!exists) {
        res.json({
            status: "error",
            message: "user with this email does not exist",
        }).status(401);
        return;
    }

	res.json({
		status: "success",
	}).status(200);
});

export default router;
