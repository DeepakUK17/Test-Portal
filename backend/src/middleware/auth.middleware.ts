import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

// Define the shape of the user object attached to the request
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const token = authHeader.split(' ')[1] ?? '';
        const payload = verifyAccessToken(token);

        if (!payload) {
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        req.user = payload;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
