const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@kahedu.edu.in' } });
    if (!admin) {
        console.log("Admin not found!");
        return;
    }
    
    await prisma.user.update({
        where: { id: admin.id },
        data: { accountStatus: 'ACTIVE', failedLoginAttempts: 0 }
    });
    console.log("Admin account unlocked and attempts reset to 0.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
