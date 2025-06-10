const express = require('express');
const router = express.Router();
const Comment = require('../models/comments');
const User = require('../models/users');
const Post = require('../models/posts');
const {isAuth,isAdmin} = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
      const comments = await Comment.find();
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});
router.post('/', async (req, res) => {
    const comment = new Comment({
      content: req.body.content,
      commentedBy: req.body.commentedBy
    });
  
    try {
      const newComment = await comment.save();
      res.status(201).json(newComment);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});
router.post('/:commentId/commentIDs', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { commentID } = req.body;

    const comment = await Comment.findById(commentId); 
    if (!comment) 
      return res.status(404).json({ message: 'Comment not found' });

    comment.commentIDs.push(commentID);
    await comment.save();

    res.json(comment);

  } catch (err) {
    console.error('Error updating comment commentIDs: ', err);
    res.status(500).json({ message: 'Error updating comment commentIDs' });
  }
});

router.post('/:commentId/votes', isAuth, async (req, res) => {
  try {
      const { commentId } = req.params;
      const { vote } = req.body;
      const { userId } = req.body;
      if (!["upvote","downvote"].includes(vote)) {
        return res.status(400).json({ message: 'Invalid vote update' });
      }

      // Check found Comment
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      else if (user.reputation < 50) {
        return res.status(403).json({ message: 'User rep too low to vote' });
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }


      // Check vote status
      const userVID = comment.usersVoted.findIndex(v => v.userID.toString() === userId);
      const voteStatus = userVID !== -1;
      let voteChange = 0;
      let repChange = 0;
      let updatedComment;

      // user has voted already
      if (voteStatus) {
        const prevVote = comment.usersVoted[userVID].voteType;
        if (prevVote === vote) {
          // Rm the user's vote, reverse changes to comment vote count and user's rep
          voteChange = vote === "upvote" ? -1 : 1; 
          repChange = vote === "upvote" ? -5 : 10;
          // Rm user from this comment's userVoted list
          comment.usersVoted.splice(userVID, 1);
        }
        else {
          return res.status(400).json({ 
            message: 'Cant directly change vote states from upvote --> downvote or vice versa.' 
          });
        }
      }
      // user hasn't voted on this comment yet
      else {
        voteChange = vote === "upvote" ? 1 : -1; 
        repChange = vote === "upvote" ? 5 : -10;
        // add user to comment's userVoted list
        comment.usersVoted.push({
          userID: userId,
          voteType: vote
        });
      }

      // update the comment's votecount & comment author's reputation
      comment.votes += voteChange;
      await comment.save();
      updatedComment = comment;

      const commentCreator = await User.findOne({ displayName: comment.commentedBy });
      if (commentCreator) {
        commentCreator.reputation += repChange;
        await commentCreator.save();
      }

      res.json(updatedComment);

  } catch (err) {
      console.error('Error updating votes', err);
      res.status(500).json({ message: 'Error updating votes' });
  }
});

router.patch('/:commentId', async (req, res) => {
  try {
        const { content } = req.body;
        const comment = await Comment.findByIdAndUpdate(
            req.params.commentId,
            { content },
            { new: true }
        );
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
 
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.delete('/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        const post = await Post.findOne({ commentIDs: req.params.commentId });
        
        const parentComment = await Comment.findOne({ commentIDs: req.params.commentId });
        
        const deleteCommentAndReplies = async (commentId) => {
            const commentToDelete = await Comment.findById(commentId);
            if (!commentToDelete) return;
            
            for (const replyId of commentToDelete.commentIDs) {
                await deleteCommentAndReplies(replyId);
            }
          
            await Comment.findByIdAndDelete(commentId);
        };
        
        await deleteCommentAndReplies(req.params.commentId);
        
        if (post) {
            post.commentIDs = post.commentIDs.filter(id => !id.equals(req.params.commentId));
            await post.save();
        } else if (parentComment) {
            parentComment.commentIDs = parentComment.commentIDs.filter(id => !id.equals(req.params.commentId));
            await parentComment.save();
        }
        
        res.json({ message: 'Comment and all replies deleted successfully' });
    } catch (err) {
        console.error('Error deleting comment and replies:', err);
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;