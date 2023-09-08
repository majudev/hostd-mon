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
	});
});

router.post('/login', async (req: Request, res: Response) => {
    const request: LoginUserRequest = req.body;

    const exists = await prisma.user.count({
        where: {
            email: request.email,
        }
    }) > 0;

    if(!exists) {
        res.status(401).json({
            status: "error",
            message: "user with this email does not exist",
        });
        return;
    }

	res.status(200).json({
		status: "success",
	});
});

export default router;
