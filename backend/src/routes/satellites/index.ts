import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'

const router = Router();
const prisma = new PrismaClient();

router.get('/host/by-extramon-pubkey/:pubkey/allowed', async (req: Request, res: Response) => {
    const pubkey: string = req.params.pubkey;

    /*const exists = await prisma.host.count({
        where: {
            extramonPubkey: pubkey
        }
    }) > 0;*/
    const exists = true;

    if(!exists) {
        res.json({
            status: "error",
            message: "this pubkey is not associated with any host",
        }).status(401);
        return;
    }

	res.json({
		status: "success",
	}).status(204);
});

export default router;
