import logger from './utils/logger';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function initDB(){
    logger.info('Initializing DB');

    const sms_account_found = await prisma.settings.count({
        where: {
            key: {
                equals: "ovhSMS.account"
            }
        }
    }) > 0;
    if(!sms_account_found){
        logger.error('Missing ovhSMS.account entry in the database');
        process.exit(-1);
    }

    const sms_login_found = await prisma.settings.count({
        where: {
            key: {
                equals: "ovhSMS.login"
            }
        }
    }) > 0;
    if(!sms_login_found){
        logger.error('Missing ovhSMS.login entry in the database');
        process.exit(-1);
    }

    const sms_password_found = await prisma.settings.count({
        where: {
            key: {
                equals: "ovhSMS.password"
            }
        }
    }) > 0;
    if(!sms_password_found){
        logger.error('Missing ovhSMS.password entry in the database');
        process.exit(-1);
    }

    const sms_from_found = await prisma.settings.count({
        where: {
            key: {
                equals: "ovhSMS.from"
            }
        }
    }) > 0;
    if(!sms_from_found){
        logger.error('Missing ovhSMS.from entry in the database');
        process.exit(-1);
    }

    const postal_baseurl_found = await prisma.settings.count({
        where: {
            key: {
                equals: "postal.baseurl"
            }
        }
    }) > 0;
    if(!postal_baseurl_found){
        const value = process.env.POSTAL_BASEURL;
        if(value === undefined || value === null || value === ""){
            logger.error('Missing POSTAL_BASEURL environmental variable');
            process.exit(-1);
        }
        logger.info('Inserting postal baseurl from .env to database');
        prisma.settings.create({
            data: {
                key: "postal.baseurl",
                value: value,
            }
        });
    }

    const postal_apitoken_found = await prisma.settings.count({
        where: {
            key: {
                equals: "postal.apitoken"
            }
        }
    }) > 0;
    if(!postal_apitoken_found){
        const value = process.env.POSTAL_APITOKEN;
        if(value === undefined || value === null || value === ""){
            logger.error('Missing POSTAL_APITOKEN environmental variable');
            process.exit(-1);
        }
        logger.info('Inserting postal api token from .env to database');
        prisma.settings.create({
            data: {
                key: "postal.apitoken",
                value: value,
            }
        });
    }

    const postal_from_found = await prisma.settings.count({
        where: {
            key: {
                equals: "postal.from"
            }
        }
    }) > 0;
    if(!postal_from_found){
        const value = process.env.POSTAL_FROM;
        if(value === undefined || value === null || value === ""){
            logger.error('Missing POSTAL_FROM environmental variable');
            process.exit(-1);
        }
        logger.info('Inserting postal FROM from .env to database');
        prisma.settings.create({
            data: {
                key: "postal.from",
                value: value,
            }
        });
    }

    var jwt_secret_found = await prisma.settings.count({
        where: {
            key: 'JWT_SECRET',
        }
    }) > 0;
    if(!jwt_secret_found){
        logger.info('No JWT secret in the database. Generating random one...');
        var random_jwt_secret = randomBytes(64).toString('hex');
        await prisma.settings.create({
            data: {
                key: 'JWT_SECRET',
                value: random_jwt_secret,
            }
        });
        logger.debug('New JWT secret is ' + random_jwt_secret);
    }

    var jwt_expdays_found = await prisma.settings.count({
        where: {
            key: 'JWT_EXPIRATION_DAYS',
        }
    }) > 0;
    if(!jwt_expdays_found){
        logger.info('No JWT expiration time in the database. Inserting default one');
        const value = "1";
        await prisma.settings.create({
            data: {
                key: 'JWT_EXPIRATION_DAYS',
                value: value,
            }
        });
        logger.debug('New JWT expiration time is ' + value + 'd');
    }

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
    }else logger.debug('' + satellite_count + ' satellites exist in the database, not adding default one');
    const users_count = await prisma.user.count();
    if(users_count === 0){
        logger.info('Adding default user');
        const user = await prisma.user.create({
            data: {
                email: 'nobody@all',
            }
        });
    }else logger.debug('' + users_count + ' users exist in the database, not adding default one');
}

export default initDB;