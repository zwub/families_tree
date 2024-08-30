import express from 'express';
import { login,refreshToken, logout } from '../Controllers/authController.js';
const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

export default router;