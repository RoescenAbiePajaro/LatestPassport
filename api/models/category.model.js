import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Static method to update post counts
categorySchema.statics.updatePostCounts = async function () {
  const Post = mongoose.model('Post');

  const counts = await Post.aggregate([
    { $match: { category: { $ne: null } } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  for (const { _id, count } of counts) {
    await this.findByIdAndUpdate(_id, { postCount: count });
  }

  const allCategoryIds = (await this.find({}, '_id')).map(cat => cat._id.toString());
  const countedIds = counts.map(c => c._id.toString());
  const uncategorizedIds = allCategoryIds.filter(id => !countedIds.includes(id));

  if (uncategorizedIds.length > 0) {
    await this.updateMany(
      { _id: { $in: uncategorizedIds } },
      { $set: { postCount: 0 } }
    );
  }
};

const Category = mongoose.model('Category', categorySchema);
export default Category;
