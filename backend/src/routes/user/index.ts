import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'

const router = Router();
const prisma = new PrismaClient();

router.get('/:id/hosts', async (req: Request, res: Response) => {
    const userId: number = parseInt(req.params.id);

    if(Number.isNaN(userId)) {
        res.json({
            status: "error",
            message: "please provide userId",
        }).status(400);
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
        res.json({
            status: "error",
            message: "user with id " + userId + " not found",
        }).status(404);
        return;
    }

    res.status(200).json(user.Hosts).end();
});

export default router;
