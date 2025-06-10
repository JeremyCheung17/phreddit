const express = require('express');
const router = express.Router();
const Community = require('../models/communities');
const Post = require('../models/posts');
const Comment = require('../models/comments');

router.get('/', async (req, res) => {
    try {
      const communities = await Community.find();
      res.json(communities);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const community = new Community({
    name: req.body.name,
    description: req.body.description,
    members: [req.body.creator],
    creator: req.body.creator
  });

  try {
    const newCommunity = await community.save();
    res.status(201).json(newCommunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:communityId/postIDs', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { postID } = req.body;
    
    const community = await Community.findById(communityId);

    if (!community) 
      return res.status(404).json({ message: 'Community not found' });

    community.postIDs.push(postID);
    await community.save();

    res.json(community);

  } catch (err) {
    console.error('Error updating community postIDs: ', err);
    res.status(500).json({ message: 'Error updating community postIDs' });
  }
});

router.post('/:communityId/join', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { displayName } = req.body;
    const community = await Community.findById(communityId);

    if (!community) 
      return res.status(404).json({ message: 'Community not found' });

    community.members.push(displayName);
    await community.save();

    res.json(community);
  } catch (err) {
    console.error('Error updating community members: ', err);
    res.status(500).json({ message: 'Error updating community members' });
  }
});

router.post('/:communityId/leave', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { displayName } = req.body;
    const community = await Community.findById(communityId);

    if (!community) 
      return res.status(404).json({ message: 'Community not found' });

    community.members = community.members.filter(username => username !== displayName);
    await community.save();

    res.json(community);
  } catch (err) {
    console.error('Error updating community members: ', err);
    res.status(500).json({ message: 'Error updating community members' });
  }
});

router.patch('/:communityId', async (req, res) => { 
    try {
        const { name, description } = req.body;
        const community = await Community.findByIdAndUpdate(
            req.params.communityId,
            { name, description },
            { new: true }
        );
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        res.json(community);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:communityId/postIDs/:postId', async (req, res) => {
  try {
    const { communityId, postId } = req.params;
    
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    community.postIDs = community.postIDs.filter(id => id.toString() !== postId);
    
    await community.save();
    
    res.json(community);
    
  } catch (err) {
    console.error('Error removing postID from community: ', err);
    res.status(500).json({ message: 'Error removing postID from community' });
  }
});

router.delete('/:communityId', async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        
        const deleteCommentAndReplies = async (commentId) => {
            const comment = await Comment.findById(commentId);
            if (!comment) return;
            
            for (const replyId of comment.commentIDs) {
                await deleteCommentAndReplies(replyId);
            }
            
            await Comment.findByIdAndDelete(commentId);
        };
        
        const deletePostAndAllComments = async (postId) => {
            const post = await Post.findById(postId);
            if (!post) return;
            
            for (const commentId of post.commentIDs) {
                await deleteCommentAndReplies(commentId);
            }
            
            await Post.findByIdAndDelete(postId);
        };
        for (const postId of community.postIDs) {
            await deletePostAndAllComments(postId);
        }
        
        await Community.findByIdAndDelete(req.params.communityId);
        
        res.json({ message: 'Community, posts, comments and all replies deleted successfully' });
    } catch (err) {
        console.error('Error deleting community and associated data:', err);
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;