import express from 'express';
import {
  deleteUser,
  getUser,
  getUsers,
  signout,
  test,
  updateUser,
  updateRole,
  approveUser,
  getPendingUsers
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/:userId', getUser);
router.put('/updateRole/:userId', verifyToken, updateRole);
router.put('/approve/:userId', verifyToken, approveUser);
router.get('/pending/users', verifyToken, getPendingUsers);

export default router;