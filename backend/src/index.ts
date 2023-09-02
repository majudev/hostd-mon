import server from './server';
import logger from './utils/logger';
import {startScheduler} from './poller';

import 'dotenv/config';

startScheduler();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => logger.info(`Server listening on http://127.0.0.1:${PORT}`));
