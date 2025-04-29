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

// Create a new category
router.post('/', verifyToken, createCategory);

// Get all categories or filter by user
router.get('/', getCategories);

// Get a single category by ID
router.get('/:categoryId', getCategoryById);

// Update a category
router.put('/:categoryId', verifyToken, updateCategory);

// Delete a category
router.delete('/:categoryId/:userId', verifyToken, deleteCategory);

// Update post counts for categories
router.post('/update-post-counts', verifyToken, updatePostCounts);

export default router;
