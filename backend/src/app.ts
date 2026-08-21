import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes';
import academicRoutes from './modules/academic/academic.routes';
import usersRoutes from './modules/users/users.routes';
import groupsRoutes from './modules/groups/groups.routes';
import questionsRoutes from './modules/questions/questions.routes';
import testsRoutes from './modules/tests/tests.routes';
import executionRoutes from './modules/execution/execution.routes';
import examRoutes from './modules/exam/exam.routes';
import reportsRoutes from './modules/reports/reports.routes';

dotenv.config();

const app = express();

app.use(helmet());
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased to 10000 to accommodate college lab environments (many students sharing one public IP)
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Base route
app.get('/api/v1', (req: Request, res: Response) => {
    res.json({ message: 'KAHE Coding Assessment Platform API v1' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/groups', groupsRoutes);
app.use('/api/v1/questions', questionsRoutes);
app.use('/api/v1/tests', testsRoutes);
app.use('/api/v1/execution', executionRoutes);
app.use('/api/v1/exam', examRoutes);
app.use('/api/v1/reports', reportsRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        success: false,
        message,
    });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
