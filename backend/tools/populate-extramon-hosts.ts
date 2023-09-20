import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateDB(){
    if(process.argv.length != 3){
        console.log('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [pubkey]');
        return;
    }

    console.log('Populating DB');
    const user = await prisma.user.findFirst();
    if(user === null){
        console.log("No user found, dying!");
        console.log(await prisma.user.count());
        return 0;
    }
    const host = await prisma.host.create({
        data: {
            userId: user.id,
            name: 'Dummy host pubkey=' + process.argv[2],
            extramonPubkey: process.argv[2],
        }
    });
    console.log('Created host with id=' + host.id + ' and extramon pubkey=' + host.extramonPubkey);
}

populateDB();