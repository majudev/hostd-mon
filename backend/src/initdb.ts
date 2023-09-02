import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function initDB(){
    console.log('Initializing DB');
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
                    address: 'satellite-de.sia.watch',
                },
                /*{
                    name: 'EU2 (Strasburg)',
                    address: 'satellite-fr.sia.watch',
                },*/
            ]
        });
    }
}

export default initDB;