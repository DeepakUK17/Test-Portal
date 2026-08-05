import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { verifyRefreshToken, generateAccessToken } from '../../utils/jwt';

export class AuthController {
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            
            if (result.requiresPasswordSetup) {
                res.json({
                    success: true,
                    data: {
                        requiresPasswordSetup: true,
                        setupToken: result.setupToken,
                        message: result.message
                    }
                });
                return;
            }

            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    accessToken: result.accessToken,
                    role: result.role
                }
            });
        } catch (error: any) {
            res.status(401).json({ success: false, message: error.message || 'Login failed' });
        }
    }

    static async setupPassword(req: Request, res: Response): Promise<void> {
        try {
            const { setupToken, newPassword } = req.body;
            const result = await AuthService.setupPassword(setupToken, newPassword);
            res.json({ success: true, message: result.message });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Password setup failed' });
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        });
        res.json({ success: true, message: 'Logged out successfully' });
    }

    static async refresh(req: Request, res: Response): Promise<void> {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            res.status(401).json({ success: false, message: 'No refresh token provided' });
            return;
        }

        const payload = verifyRefreshToken(refreshToken);
        
        if (!payload) {
            res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
            return;
        }

        const newAccessToken = generateAccessToken({ userId: payload.userId, role: payload.role });
        
        res.json({
            success: true,
            data: { accessToken: newAccessToken }
        });
    }
}


