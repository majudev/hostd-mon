import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'

const router = Router();
const prisma = new PrismaClient();

router.get('/host/by-extramon-pubkey/:pubkey/allowed', async (req: Request, res: Response) => {
    const pubkey: string = req.params.pubkey;

    const hosts = await prisma.host.count({
        where: {
            extramonPubkey: pubkey
        }
    });

    const exists = hosts > 0;

    if(!exists) {
        res.status(401).json({
            status: "error",
            message: "this pubkey is not associated with any host",
        });
        return;
    }

	res.json({
		status: "success",
	}).status(204);
});

router.get('/', async (req: Request, res: Response) => {
    const satellites = await prisma.satellite.findMany({
        select:{
            name: true,
            address: true,
        }
    });

	res.status(200).json(satellites);
});

export default router;
