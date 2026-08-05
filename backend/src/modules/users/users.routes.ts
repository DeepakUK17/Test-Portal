import { Router } from 'express';
import multer from 'multer';
import { UsersController } from './users.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { createStudentSchema, createFacultySchema, updateStudentSchema, updateFacultySchema, resetPasswordSchema, updateUserStatusSchema, bulkActionSchema } from './users.validator';

const upload = multer({ dest: 'uploads/' }); // Temporary storage for CSV files
const router = Router();

// Require authentication for all user routes
router.use(authenticate);

// --- Students ---
// Both ADMIN and FACULTY can view students (Faculty needs this to add students to groups)
router.get('/students', authorize(['ADMIN', 'FACULTY']), UsersController.getStudents);

// Only ADMIN can perform write operations on students
router.post('/students', authorize(['ADMIN']), validate(createStudentSchema), UsersController.createStudent);
router.put('/students/:id', authorize(['ADMIN']), validate(updateStudentSchema), UsersController.updateStudent);
router.post('/students/bulk-import', authorize(['ADMIN']), upload.single('file'), UsersController.bulkImportStudents);
router.post('/students/bulk-delete', authorize(['ADMIN']), validate(bulkActionSchema), UsersController.bulkDeleteStudents);
router.post('/students/bulk-promote', authorize(['ADMIN']), validate(bulkActionSchema), UsersController.bulkPromoteStudents);

// --- Faculty ---
// Both ADMIN and FACULTY can view faculty (Faculty might need this for some views)
router.get('/faculty', authorize(['ADMIN', 'FACULTY']), UsersController.getFaculty);

// Only ADMIN can create/update faculty
router.post('/faculty', authorize(['ADMIN']), validate(createFacultySchema), UsersController.createFaculty);
router.put('/faculty/:id', authorize(['ADMIN']), validate(updateFacultySchema), UsersController.updateFaculty);

// --- Admin Operations ---
router.post('/reset-password', authorize(['ADMIN']), validate(resetPasswordSchema), UsersController.resetPassword);
router.put('/:id/status', authorize(['ADMIN']), validate(updateUserStatusSchema), UsersController.updateUserStatus);
router.delete('/:id', UsersController.deleteUser);

export default router;
