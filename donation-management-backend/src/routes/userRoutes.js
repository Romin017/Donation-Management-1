import express from 'express';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import { createUser, getUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.post('/', requireAdmin, createUser);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;