const express = require('express');
const router = express.Router();
const Post = require('../models/posts');
const User = require('../models/users');
const Community = require('../models/communities');
const Comment = require('../models/comments');
const {isAuth,isAdmin} = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
      const posts = await Post.find();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).lean();
      if (!post) return res.status(404).json({ message: 'Post not found' });
      
      await post.save();
      
      res.json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      linkFlairID: req.body.linkFlairID,
      postedBy: req.body.postedBy,
    });
    try {
      const newPost = await post.save();
      res.status(201).json(newPost);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

router.post('/:postId/commentIDs', async (req, res) => {
    try {
      const { postId } = req.params;
      const { commentID } = req.body;
  
      const post = await Post.findById(postId);
  
      if (!post) 
        return res.status(404).json({ message: 'Post not found' });
  
      post.commentIDs.push(commentID);
      await post.save();
  
      res.json(post);
  
    } catch (err) {
      console.error('Error updating post commentIDs: ', err);
      res.status(500).json({ message: 'Error updating post commentIDs' });
    }
});

router.post('/:postId/views', async (req, res) => {
  try {
      const { postId } = req.params;
      let post = await Post.findByIdAndUpdate(
        postId,
        { $inc: { views: 1 } },
      );
    if (!post) 
      return res.status(404).json({ message: 'Post not found' });
    res.json(post);

  } catch (err) {
      console.error('Error incrementing views: ', err);
      res.status(500).json({ message: 'Error incrementing views' });
  }
});

router.post('/:postId/votes', isAuth, async (req, res) => {
  try {
      const { postId } = req.params;
      const { vote } = req.body;
      const { userId } = req.body;
      if (!["upvote","downvote"].includes(vote)) {
        return res.status(400).json({ message: 'Invalid vote update' });
      }

      // Check found post
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      else if (user.reputation < 50) {
        return res.status(403).json({ message: 'User rep too low to vote' });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }


      // Check vote status
      const userVID = post.usersVoted.findIndex(v => v.userID.toString() === userId);
      const voteStatus = userVID !== -1;
      let voteChange = 0;
      let repChange = 0;
      let updatedPost;

      // user has voted already
      if (voteStatus) {
        const prevVote = post.usersVoted[userVID].voteType;
        if (prevVote === vote) {
          // Rm the user's vote, reverse changes to post vote count and user's rep
          voteChange = vote === "upvote" ? -1 : 1; 
          repChange = vote === "upvote" ? -5 : 10;
          // Rm user from this post's userVoted list
          post.usersVoted.splice(userVID, 1);
        }
        else {
          return res.status(400).json({ 
            message: 'Cant directly change vote states from upvote --> downvote or vice versa.' 
          });
        }
      }
      // user hasn't voted on this post yet
      else {
        voteChange = vote === "upvote" ? 1 : -1; 
        repChange = vote === "upvote" ? 5 : -10;
        // add user to post's userVoted list
        post.usersVoted.push({
          userID: userId,
          voteType: vote
        });
      }

      // update the post's votecount & post author's reputation
      post.votes += voteChange;
      await post.save();
      updatedPost = post;

      const postCreator = await User.findOne({ displayName: post.postedBy });
      if (postCreator) {
        postCreator.reputation += repChange;
        await postCreator.save();
      }

      res.json(updatedPost);

  } catch (err) {
      console.error('Error updating votes', err);
      res.status(500).json({ message: 'Error updating votes' });
  }
});

router.patch('/:postId', async (req, res) => { 
    try {
        const { title, content, linkFlairID } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { title, content, linkFlairID },
            { new: true }
        );
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        const deleteCommentAndReplies = async (commentId) => {
            const comment = await Comment.findById(commentId);
            if (!comment) return;
            
            for (const replyId of comment.commentIDs) {
                await deleteCommentAndReplies(replyId);
            }
            
            await Comment.findByIdAndDelete(commentId);
        };
        
        for (const commentId of post.commentIDs) {
            await deleteCommentAndReplies(commentId);
        }
        await Post.findByIdAndDelete(req.params.postId);
        
        res.json({ message: 'Post, comments and all replies deleted successfully' });
    } catch (err) {
        console.error('Error deleting post and associated comments:', err);
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;