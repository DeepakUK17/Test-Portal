import { z } from 'zod';

export const checkEmailSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address').endsWith('@kahedu.edu.in', 'Must use a valid college email'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address').endsWith('@kahedu.edu.in', 'Must use a valid college email'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const setupPasswordSchema = z.object({
    body: z.object({
        setupToken: z.string().min(1, 'Setup token is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, 'Old password is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    }),
});
