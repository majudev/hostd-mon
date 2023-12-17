import { Worker, MessagePort, isMainThread, parentPort, workerData } from 'node:worker_threads';
import logger from '../utils/logger';
import {performance} from 'perf_hooks';
import { PrismaClient } from '@prisma/client';
import sendNotificationSMS from '../notifier/notify-sms';
import sendNotificationEmail from '../notifier/notify-email';

const prisma = new PrismaClient();

function spawnExtramonNotifier() : Worker {
    const worker = new Worker(__filename, { workerData: null });
    return worker;
}

async function workerFunction(){
    const dataToHash: string = workerData;

    const startTime = performance.now();

    const satellites = await prisma.satellite.findMany({
        select: {
            name: true,
            address: true,
        }
    });

    const afterSatellitesFound = performance.now();

    const hosts = await prisma.host.findMany({
        where: {
            extramonPubkey: {
                not: null,
            },
        },
        select: {
            id: true,
            userId: true,
            name: true,
            extramonDeadtime: true,

            alertEmail: true,
            alertPhone: true,

            User: {
                select: {
                    alertEmail: true,
                    alertPhoneNumber: true,
                    globallyDisableEmailAlerts: true,
                    globallyDisablePhoneAlerts: true,
                }
            }
        }
    });

    const afterHostsFound = performance.now();

    const hostsPromise = hosts.map(async host => {
        const lastUptimeEntry = await prisma.extramonUptimeEntry.findFirst({
            select: {
                id: true,
                timestamp: true,
                deadtime: true,
                Alert: {
                    select: {
                        id: true,
                    }
                },
                Satellite: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        active: true,
                    }
                }
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        if(lastUptimeEntry === null) return;

        const timestamp = new Date;
        if(lastUptimeEntry.timestamp.getTime() + lastUptimeEntry.deadtime * 1000 < timestamp.getTime()){
            if(lastUptimeEntry.Alert.length > 0) return;

            const inactivityPeriod = (timestamp.getTime() - lastUptimeEntry.timestamp.getTime()) / 1000;
            const inactivityPeriodString = (inactivityPeriod < 60) ? (Math.floor(inactivityPeriod) + 's') : 
                                          ((inactivityPeriod/60 < 60) ? (Math.floor(inactivityPeriod / 60) + 'min') : (
                                           (inactivityPeriod/3600 < 24) ? (Math.floor(inactivityPeriod/3600) + 'h') : (Math.floor(inactivityPeriod/3600/24) + 'd')
                                          ));

            var sentTo = new Array();
            const alertPhone = host.alertPhone && !host.User.globallyDisablePhoneAlerts;
            const alertEmail = host.alertEmail && !host.User.globallyDisableEmailAlerts;

            if(alertPhone && host.User.alertPhoneNumber !== null){
                //Phone alert
                sentTo.push('Phone: ' + host.User.alertPhoneNumber);
                ///TODO: do something...
                console.log("To phone " + host.User.alertPhoneNumber + ": Your host " + host.name + " has been dead for " + inactivityPeriodString + ", so the alert has been sent.");
                sendNotificationSMS(host.User.alertPhoneNumber, "Your host " + host.name + " has been dead for " + inactivityPeriodString + ", so the alert has been sent.");
            }

            if(alertEmail && host.User.alertEmail !== null){
                //Email alert
                sentTo.push('Email: ' + host.User.alertEmail);
                ///TODO: do something...
                console.log("To email " + host.User.alertEmail + ": Your host " + host.name + " has been dead for " + inactivityPeriodString + ", so the alert has been sent.");
                sendNotificationEmail(host.User.alertEmail, "no-reply@sia.watch", "Sia hostd down", "Your host " + host.name + " has been dead for " + inactivityPeriodString + ", so the alert has been sent.", "<p>Your host <b>" + host.name + "</b> has been dead for <b>" + inactivityPeriodString + "</b>, so the alert has been sent.</p>");
            }

            await prisma.alert.create({
                data: {
                    extramonEventId: lastUptimeEntry.id,
                    userId: host.userId,
                    hostId: host.id,
                    timestamp: timestamp,
                    message: "Your host " + host.name + " has not responded to extramon ping for " + inactivityPeriodString + ", so the alert was sent.",
                    sentTo: sentTo,
                }
            });
        }
    });

    await Promise.all(hostsPromise);

    const afterHostsProcessed = performance.now();

    console.debug('Sent alerts - took ' + (afterHostsProcessed - startTime).toFixed(3) + 'ms, including:');
    console.debug('- ' + (afterSatellitesFound-startTime).toFixed(3) + 'ms to retrieve satellites from DB');
    console.debug('- ' + (afterHostsFound-afterSatellitesFound).toFixed(3) + 'ms to retrieve all hosts with extramon monitoring enabled');
    console.debug('- ' + (afterHostsProcessed-afterHostsFound).toFixed(3) + 'ms to send all notifications');

    (parentPort as MessagePort).postMessage(dataToHash);
}

// If we are inside thread
if (!isMainThread) {
    workerFunction();
}

export default spawnExtramonNotifier;