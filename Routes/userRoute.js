import express from 'express';
import { rigsterUser, getAllUser , getUserById, updateById, updateRole, deleteUserById, userDistribute, getUnAssignedUsers, assignUserToFamilyById} from '../Controllers/userController.js';
import { verifyToken, checkAdminRole, checkSuperAdminRole} from '../Middlewares/authMiddleware.js';
const router = express.Router();

router.post('/rigster', rigsterUser);
router.post('/distribute-users', verifyToken, checkAdminRole, userDistribute);
router.post('/assign-family/:id', verifyToken, checkAdminRole, assignUserToFamilyById);
router.put('/:id',verifyToken,checkAdminRole, updateById);
router.put('/role/:id', verifyToken,checkSuperAdminRole, updateRole);
router.get('/alluser', verifyToken,checkAdminRole, getAllUser);
router.get('/:id',verifyToken,checkAdminRole, getUserById);
router.get('/', verifyToken, checkAdminRole, getUnAssignedUsers);
router.delete('/:id',verifyToken, checkAdminRole,  deleteUserById);






export default router;