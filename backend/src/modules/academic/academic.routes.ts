import { Router } from 'express';
import { AcademicController } from './academic.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import {
    createDepartmentSchema, updateDepartmentSchema,
    createStudyYearSchema, createSemesterSchema,
    createSectionSchema, createSubjectSchema
} from './academic.validator';

const router = Router();

// All academic structure endpoints require authentication
router.use(authenticate);

// --- Departments ---
// Only Admin can create/update/delete. Anyone authenticated can get.
router.get('/departments', AcademicController.getDepartments);
router.post('/departments', authorize(['ADMIN']), validate(createDepartmentSchema), AcademicController.createDepartment);
router.put('/departments/:id', authorize(['ADMIN']), validate(updateDepartmentSchema), AcademicController.updateDepartment);
router.delete('/departments/:id', authorize(['ADMIN']), AcademicController.deleteDepartment);

// --- Study Years ---
router.get('/study-years', AcademicController.getStudyYears);
router.post('/study-years', authorize(['ADMIN']), validate(createStudyYearSchema), AcademicController.createStudyYear);

// --- Semesters ---
router.get('/semesters', AcademicController.getSemesters);
router.post('/semesters', authorize(['ADMIN']), validate(createSemesterSchema), AcademicController.createSemester);

// --- Sections ---
router.get('/sections', AcademicController.getSections);
router.post('/sections', authorize(['ADMIN']), validate(createSectionSchema), AcademicController.createSection);
router.delete('/sections/:id', authorize(['ADMIN']), AcademicController.deleteSection);

// --- Subjects ---
router.get('/subjects', AcademicController.getSubjects);
router.post('/subjects', authorize(['ADMIN']), validate(createSubjectSchema), AcademicController.createSubject);
router.put('/subjects/:id', authorize(['ADMIN']), AcademicController.updateSubject); // basic update schema can be added
router.delete('/subjects/:id', authorize(['ADMIN']), AcademicController.deleteSubject);

export default router;
