import Comment from '../models/comment.model.js';
import { errorHandler } from '../utils/error.js'; // I'm assuming you have this imported elsewhere

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId, parentId } = req.body;

    if (userId !== req.user.id) {
      return next(
        errorHandler(403, 'You are not allowed to create this comment')
      );
    }

    // Create a new comment object
    const newComment = new Comment({
      content,
      postId,
      userId,
    });

    // If parentId exists, this is a reply
    if (parentId) {
      // Find the parent comment
      const parentComment = await Comment.findById(parentId);
      
      if (!parentComment) {
        return next(errorHandler(404, 'Parent comment not found'));
      }
      
      // Set reply-specific fields
      newComment.parentId = parentId;
      newComment.isReply = true;
      
      // Save the reply
      await newComment.save();
      
      // Update the parent comment's replies array and replyCount
      parentComment.replies.push(newComment._id);
      parentComment.replyCount += 1;
      await parentComment.save();
    } else {
      // This is a regular comment, not a reply
      await newComment.save();
    }

    res.status(200).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    // Get top-level comments (not replies) for the post
    const comments = await Comment.find({ 
      postId: req.params.postId,
      isReply: false 
    }).sort({
      createdAt: -1,
    });
    
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const getReplies = async (req, res, next) => {
  try {
    const parentComment = await Comment.findById(req.params.commentId);
    
    if (!parentComment) {
      return next(errorHandler(404, 'Comment not found'));
    }
    
    // If the parent comment has replies
    if (parentComment.replyCount > 0) {
      // Find all reply comments where parentId equals the comment ID
      const replies = await Comment.find({ 
        parentId: req.params.commentId 
      }).sort({
        createdAt: -1,
      });
      
      res.status(200).json(replies);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      comment.numberOfLikes += 1;
      comment.likes.push(req.user.id);
    } else {
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, 'You are not allowed to edit this comment')
      );
    }

    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content,
      },
      { new: true }
    );
    res.status(200).json(editedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, 'You are not allowed to delete this comment')
      );
    }

    // If this is a parent comment with replies, delete all its replies too
    if (!comment.isReply && comment.replyCount > 0) {
      await Comment.deleteMany({ parentId: req.params.commentId });
    }
    
    // If this is a reply, update the parent comment's replies array and replyCount
    if (comment.isReply && comment.parentId) {
      const parentComment = await Comment.findById(comment.parentId);
      if (parentComment) {
        // Remove this reply from parent's replies array
        const replyIndex = parentComment.replies.indexOf(req.params.commentId);
        if (replyIndex !== -1) {
          parentComment.replies.splice(replyIndex, 1);
          parentComment.replyCount -= 1;
          await parentComment.save();
        }
      }
    }
    
    // Delete the comment itself
    await Comment.findByIdAndDelete(req.params.commentId);
    
    res.status(200).json('Comment has been deleted');
  } catch (error) {
    next(error);
  }
};

export const getcomments = async (req, res, next) => {
  if (!req.user.isAdmin)
    return next(errorHandler(403, 'You are not allowed to get all comments'));
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'desc' ? -1 : 1;
    const comments = await Comment.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalComments = await Comment.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthComments = await Comment.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({ comments, totalComments, lastMonthComments });
  } catch (error) {
    next(error);
  }
};