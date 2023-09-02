import { Router, Request, Response } from 'express';
import authRouter from './auth';
import hostRouter from './host';
import satellitesRouter from './satellites';

const router = Router();

router.use('/auth', authRouter);
router.use('/host', hostRouter);
router.use('/satellites', satellitesRouter);

// router.get, etc HERE

/* test endpoint */
router.get('/', async (req: Request, res: Response) => {
	res.json({
		success: true,
		msg: 'hello world from /api'
	});
});

export default router;
