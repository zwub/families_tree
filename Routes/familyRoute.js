import express from 'express';
import { createFamily, deleteFamilyById, getAllFamily, updateFamilyById, getFamilyById, getFamilyMembers, updateFatherAndMother} from '../Controllers/familyController.js';
import { checkAdminRole, verifyToken } from '../Middlewares/authMiddleware.js';
const router = express.Router();


router.post('/create', verifyToken, checkAdminRole, createFamily);
router.delete('/delete/:id', verifyToken, checkAdminRole, deleteFamilyById);
router.get('/', verifyToken, checkAdminRole, getAllFamily);
router.get('/family-members/:id',verifyToken, checkAdminRole, getFamilyMembers);
router.get('/:id', verifyToken, checkAdminRole, getFamilyById);
router.put('/:id', verifyToken, checkAdminRole, updateFamilyById);
router.put('/update-parent/:id', verifyToken, checkAdminRole, updateFatherAndMother);



export default router;