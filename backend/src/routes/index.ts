import { Router } from 'express';
import authRouter from '../routes/auth';
import {HelloWorldHandler} from '../controllers';

const router = Router();

router.use('/auth', authRouter);

// router.get, etc HERE

/* test endpoint */
router.get('/', HelloWorldHandler);

export default router;
