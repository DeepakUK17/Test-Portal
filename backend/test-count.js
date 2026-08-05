const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const depts = await prisma.department.findMany({
        include: {
            _count: {
                select: { Students: true, Faculty: true }
            }
        }
    });
    console.log(JSON.stringify(depts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
