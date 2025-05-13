import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

export const create = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return next(errorHandler(401, 'Unauthorized: Please log in'));
    }

    // Count exisitng post by this user
    const countPost = await Post.countDocuments({ userId: req.user.id });
    if (countPost >= 5) {
      return next(errorHandler(403, 'You have reached the maximum of 5 posts'));
    }

    // Validate required fields
    const { title, content, image, category } = req.body;
    if (!title || !content) {
      return next(errorHandler(400, 'Title and content are required'));
    }

    // Generate a slug for the post
    const slug = title
      .toLowerCase()
      .split(' ')
      .join('-')
      .replace(/[^a-z0-9-]/g, '');

    // Create new post
    const newPost = new Post({
      title,
      content,
      image,
      category: category || 'uncategorized',
      slug,
      userId: req.user.id,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    // Check if user is admin or the owner of the post
    if (!req.user.isAdmin && req.user.id !== post.userId.toString()) {
      return next(errorHandler(403, 'You are not allowed to delete this post'));
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    // Allow update if user is admin OR if user is the post owner
    if (!req.user.isAdmin && req.user.id !== post.userId.toString()) {
      return next(errorHandler(403, 'You are not allowed to update this post'));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// In your post.controller.js
export const getPostViews = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    // Get all posts with view data and populate user info
    const posts = await Post.find()
      .select('title views viewHistory')
      .populate({
        path: 'viewHistory.userId',
        select: 'username profilePicture email'
      })
      .sort({ views: -1 })
      .limit(10);
    
    // Process view history data
    const viewData = posts.map(post => ({
      title: post.title,
      totalViews: post.views || 0,
      uniqueViewers: post.viewHistory?.length || 0,
      viewHistory: post.viewHistory?.map(view => ({
        username: view.userId?.username || 'Anonymous',
        profilePicture: view.userId?.profilePicture || '/default-avatar.jpg',
        email: view.userId?.email || '',
        viewedAt: view.viewedAt
      })) || []
    }));
    
    res.status(200).json(viewData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};