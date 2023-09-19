import { createClient } from 'redis';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function JWT_SECRET() {
    try{
        const client = createClient({
            url: process.env.REDIS_URL
        });
        await client.connect();

        let jwt_secret_redis = await client.get('JWT_SECRET');
        if(jwt_secret_redis === null){
            var jwt_secret_mysql = await prisma.settings.findFirstOrThrow({
                select: {
                    value: true,
                },
                where: {
                    key: 'JWT_SECRET',
                }
            });
            
            client.set('JWT_SECRET', jwt_secret_mysql.value);
            jwt_secret_redis = jwt_secret_mysql.value;
        }

        return jwt_secret_redis as string;
    }catch(error){
        console.error('Cannot obtain JWT from database: ', error);
        throw error;
    }
}

export async function JWT_EXPIRATION_DAYS() {
    try{
        const client = createClient({
            url: process.env.REDIS_URL
        });
        await client.connect();

        let jwt_secret_redis = await client.get('JWT_EXPIRATION_DAYS');
        if(jwt_secret_redis === null){
            var jwt_secret_mysql = await prisma.settings.findFirstOrThrow({
                select: {
                    value: true,
                },
                where: {
                    key: 'JWT_EXPIRATION_DAYS',
                }
            });
            
            client.set('JWT_EXPIRATION_DAYS', jwt_secret_mysql.value);
            jwt_secret_redis = jwt_secret_mysql.value;
        }

        return jwt_secret_redis as string;
    }catch(error){
        console.error('Cannot obtain JWT expiration time from database: ', error);
        throw error;
    }
}