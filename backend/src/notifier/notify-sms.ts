import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendNotificationSMS(to: string, message: string){
    const accountPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "ovhSMS.account"
            }
        }
    });

    const loginPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "ovhSMS.login"
            }
        }
    });

    const passwordPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "ovhSMS.password"
            }
        }
    });

    const fromPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "ovhSMS.from"
            }
        }
    });

    const account = await accountPromise;
    const login = await loginPromise;
    const password = await passwordPromise;
    const from = await fromPromise;

    if(account === null || login === null || password === null || from === null) return false;

    const response = await fetch(
        'https://www.ovh.com/cgi-bin/sms/http2sms.cgi?'+
        '&account=' + encodeURIComponent(account.value)
        + '&login=' + encodeURIComponent(login.value)
        + '&password=' + encodeURIComponent(password.value)
        + '&from=' + encodeURIComponent(from.value)
        + '&to=' + encodeURIComponent(to)
        + '&SMSencoding=2&contentType=application%2Fjson'
        + '&message=' + encodeURIComponent(message)
        ,{
            method: "GET",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
        }
    );
    if(!response.ok){
        const body = await response.json();
        logger.error('Error when sending SMS to ' + to + ': ' + JSON.stringify(body));
        return false;
    }
    return true;
}

export default sendNotificationSMS;