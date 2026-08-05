import { PrismaClient, Role, AccountStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@kahedu.edu.in';
    const adminPassword = 'admin'; // For demo/setup purposes

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log('Admin user already exists.');
        return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            passwordHash: passwordHash,
            role: Role.ADMIN,
            firstLogin: true, // Force password change on first login
            accountStatus: AccountStatus.ACTIVE,
        },
    });

    console.log(`Admin user created with ID: ${admin.id}`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('Please change the password on first login.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
