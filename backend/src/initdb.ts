import logger from './utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function initDB(){
    logger.info('Initializing DB');
    const satellite_count = await prisma.satellite.count();
    if(satellite_count === 0){
        console.log('Adding default satellites');
        await prisma.satellite.createMany({
            data: [
                {
                    name: 'EU1 (Frankfurt)',
                    address: 'satellite-de.sia.watch',
                },
                {
                    name: 'CA1 (Beauharnois)',
                    address: 'satellite-ca.sia.watch',
                },
                /*{
                    name: 'EU2 (Strasburg)',
                    address: 'satellite-fr.sia.watch',
                },*/
            ]
        });
    }
    const users_count = await prisma.user.count();
    if(users_count === 0){
        logger.info('Adding default user');
        const user = await prisma.user.create({
            data: {
                email: 'nobody@all',
            }
        });
    }
}

export default initDB;