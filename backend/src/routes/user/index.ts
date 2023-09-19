import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'

const router = Router();
const prisma = new PrismaClient();

router.get('/:id/hosts', async (req: Request, res: Response) => {
    if(!res.locals.authenticated){
        res.status(401).end();
        return;
    }

    const userId: number = parseInt(req.params.id);

    if(Number.isNaN(userId)) {
        res.status(400).json({
            status: "error",
            message: "please provide userId",
        });
        return;
    }

    // User can only view his hosts, admin can view everything
    if(userId != res.locals.auth_user.userId && !res.locals.auth_user.admin){
        res.status(403).json({
            status: "error",
            message: "you don't have permissions to view this userId",
        }).end();
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true,
            Hosts: {
                select: {
                    id: true,
                    rhpAddress: true,
                    rhpPubkey: true,
                    extramonPubkey: true,
                },
            },
        },
    });

    if(user === null){
        res.status(404).json({
            status: "error",
            message: "user with id " + userId + " not found",
        });
        return;
    }

    res.status(200).json(user.Hosts).end();
});

export default router;
