import { Request, Response, NextFunction } from 'express';

export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            if (!allowedRoles.includes(req.user.role)) {
                res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };
};
