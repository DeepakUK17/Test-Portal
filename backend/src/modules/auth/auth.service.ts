import prisma from '../../config/db';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import jwt from 'jsonwebtoken';

export class AuthService {
    static async login(email: string, passwordPlain: string) {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (user.accountStatus !== 'ACTIVE') {
            throw new Error(`Account is ${user.accountStatus.toLowerCase()}`);
        }

        if (user.firstLogin || !user.passwordHash) {
            // Generate a temporary setup token for the frontend to use in the setup-password step
            const setupToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev_secret_change_in_production', { expiresIn: '15m' });
            return {
                requiresPasswordSetup: true,
                setupToken,
                message: 'Password setup required'
            };
        }

        const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);

        if (!isPasswordValid) {
            // Increment failed login attempts (auto-lock disabled)
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: { increment: 1 }
                }
            });
            throw new Error('Invalid credentials');
        }

        // Reset failed login attempts and update last login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lastLogin: new Date()
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                entity: 'USER',
                entityId: user.id
            }
        });

        const tokenPayload = { userId: user.id, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return {
            requiresPasswordSetup: false,
            accessToken,
            refreshToken,
            role: user.role
        };
    }

    static async setupPassword(setupToken: string, newPasswordPlain: string) {
        let payload: any;
        try {
            payload = jwt.verify(setupToken, process.env.JWT_SECRET || 'dev_secret_change_in_production');
        } catch (error) {
            throw new Error('Invalid or expired setup token');
        }

        const userId = payload.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || (!user.firstLogin && user.passwordHash)) {
            throw new Error('Password setup not required or invalid state');
        }

        const passwordHash = await bcrypt.hash(newPasswordPlain, 12);

        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash,
                firstLogin: false,
                passwordChangedAt: new Date()
            }
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: 'SETUP_PASSWORD',
                entity: 'USER',
                entityId: userId
            }
        });

        return { message: 'Password set successfully' };
    }
}
