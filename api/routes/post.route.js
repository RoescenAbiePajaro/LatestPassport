import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, deletepost, getposts, updatepost, getPostViews } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getposts', getposts);
router.get('/getallposts', getposts);
router.get('/postviews', verifyToken, getPostViews); 
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);
// In your post route for viewing a single post
router.put('/view/:postId', async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Increment view count
      post.views += 1;
  
      // Record view history if user is logged in
      if (req.user) {
        post.viewHistory.push({
          userId: req.user.id,
          viewedAt: new Date()
        });
      }
  
      await post.save();
      res.status(200).json({ views: post.views });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

export default router;