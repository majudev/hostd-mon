import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dropDB(){
    console.log('Cleaning DB');
    await prisma.user.deleteMany();
    await prisma.satellite.deleteMany();
}

dropDB();