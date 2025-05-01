import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  updatePostCounts,
} from '../controllers/category.controller.js';

const router = express.Router();

router.post('/', verifyToken, createCategory);
router.get('/', getCategories);
router.get('/:categoryId', getCategoryById);
router.put('/:categoryId', verifyToken, updateCategory);
router.delete('/:categoryId', verifyToken, deleteCategory);
router.post('/update-post-counts', verifyToken, updatePostCounts);

export default router;