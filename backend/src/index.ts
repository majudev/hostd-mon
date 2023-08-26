import server from '@server';
import logger from '@utils/logger';

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => logger.info(`Server listening on http://127.0.0.1:${PORT}`));
