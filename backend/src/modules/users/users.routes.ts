import { Router } from 'express';
import multer from 'multer';
import { UsersController } from './users.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { createStudentSchema, createFacultySchema, updateStudentSchema, updateFacultySchema, resetPasswordSchema, updateUserStatusSchema, bulkActionSchema } from './users.validator';

const upload = multer({ dest: 'uploads/' }); // Temporary storage for CSV files
const router = Router();

// All user management endpoints require authentication and ADMIN role
router.use(authenticate);
router.use(authorize(['ADMIN']));

// --- Students ---
router.get('/students', UsersController.getStudents);
router.post('/students', validate(createStudentSchema), UsersController.createStudent);
router.put('/students/:id', validate(updateStudentSchema), UsersController.updateStudent);
router.post('/students/bulk-import', upload.single('file'), UsersController.bulkImportStudents);
router.post('/students/bulk-delete', validate(bulkActionSchema), UsersController.bulkDeleteStudents);
router.post('/students/bulk-promote', validate(bulkActionSchema), UsersController.bulkPromoteStudents);

// --- Faculty ---
router.get('/faculty', UsersController.getFaculty);
router.post('/faculty', validate(createFacultySchema), UsersController.createFaculty);
router.put('/faculty/:id', validate(updateFacultySchema), UsersController.updateFaculty);

// --- Admin Operations ---
router.post('/reset-password', validate(resetPasswordSchema), UsersController.resetPassword);
router.put('/:id/status', validate(updateUserStatusSchema), UsersController.updateUserStatus);
router.delete('/:id', UsersController.deleteUser);

export default router;
