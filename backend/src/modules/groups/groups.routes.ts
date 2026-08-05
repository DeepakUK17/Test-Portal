import { Router } from 'express';
import { GroupsController } from './groups.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { createGroupSchema, addStudentsToGroupSchema, removeStudentFromGroupSchema } from './groups.validator';

const router = Router();

// Groups require authentication
router.use(authenticate);

// Both Admin and Faculty can manage groups
router.use(authorize(['ADMIN', 'FACULTY']));

router.get('/', GroupsController.getGroups);
router.post('/', validate(createGroupSchema), GroupsController.createGroup);

router.get('/:id', GroupsController.getGroupById);
router.post('/:id/members', validate(addStudentsToGroupSchema), GroupsController.addStudents);
router.delete('/:id/members/:studentId', validate(removeStudentFromGroupSchema), GroupsController.removeStudent);

export default router;
