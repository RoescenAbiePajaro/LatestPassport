import Category from '../models/category.model.js';

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, userId } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      user: userId 
    });
    
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'A category with that name already exists' });
    }

    const newCategory = new Category({
      name,
      description,
      user: userId,
    });

    await newCategory.save();

    res.status(201).json({
      success: true, 
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Something went wrong while creating the category' 
    });
  }
};

// Get categories for user or all categories for admin
exports.getCategories = async (req, res) => {
  try {
    const { userId } = req.query;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = 9; // Display 9 categories per page
    
    let query = {};
    
    // If userId provided, get categories for that user only
    if (userId) {
      query.user = userId;
    }

    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      categories 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching categories' 
    });
  }
};

// Get a specific category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Error fetching category' });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, userId } = req.body;
    
    // Find the category
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Check if user owns this category or is admin
    if (category.user.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this category' });
    }
    
    // Check if the new name already exists for another category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }, 
        user: userId,
        _id: { $ne: categoryId } 
      });
      
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'A category with that name already exists' });
      }
    }
    
    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name: name || category.name, description: description || category.description },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Category updated successfully', 
      category: updatedCategory 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Error updating category' });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId, userId } = req.params;
    
    // Find the category
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Check if user owns this category or is admin
    if (category.user.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this category' });
    }
    
    // Delete the category
    await Category.findByIdAndDelete(categoryId);
    
    // Optional: Handle related posts (e.g., set their category to null or default)
    const Post = mongoose.model('Post');
    await Post.updateMany(
      { category: categoryId },
      { $set: { category: null } }
    );
    
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Error deleting category' });
  }
};

// Count posts for a category
export const updatePostCounts = async (req, res) => {
    try {
      await Category.updatePostCounts();
      res.status(200).json({ success: true, message: 'Post counts updated successfully' });
    } catch (error) {
      console.error('Error updating post counts:', error);
      res.status(500).json({ success: false, message: 'Error updating post counts' });
    }
  };