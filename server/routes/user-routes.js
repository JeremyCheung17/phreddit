const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Post = require('../models/posts');
const Community = require('../models/communities');
const Comment = require('../models/comments');
const {isAuth, isAdmin} = require('../middleware/auth')

// all users
router.get('/', isAuth, isAdmin, async (req,res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.get("/check-taken", async (req,res) => {
    try {
        const userEmail = await User.findOne({ email: req.query.email });
        const username = await User.findOne({ displayName: req.query.displayName });
        const user = {
            emailTaken: userEmail ? true: false,
            nameTaken: username ? true : false,
        };
        res.json(user);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', isAuth, async (req,res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash -email');
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
})

router.delete('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
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
            
            const community = await Community.findOne({ postIDs: postId });
            if (community) {
                community.postIDs = community.postIDs.filter(id => !id.equals(postId));
                await community.save();
            }
            
            await Post.findByIdAndDelete(postId);
        };
        
        const deleteCommunityAndAllContent = async (communityId) => {
            const community = await Community.findById(communityId);
            if (!community) return;
            
            for (const postId of community.postIDs) {
                await deletePostAndAllComments(postId);
            }
            

            await Community.findByIdAndDelete(communityId);
        };
        
        const userCommunities = await Community.find({ creator: user.displayName });
        for (const community of userCommunities) {
            await deleteCommunityAndAllContent(community._id);
        }
        
        const userPosts = await Post.find({ postedBy: user.displayName });
        for (const post of userPosts) {
            await deletePostAndAllComments(post._id);
        }
        
        const userComments = await Comment.find({ commentedBy: user.displayName });
        for (const comment of userComments) {
            const parentPost = await Post.findOne({ commentIDs: comment._id });
            if (parentPost) {
                parentPost.commentIDs = parentPost.commentIDs.filter(id => !id.equals(comment._id));
                await parentPost.save();
            }
            
            const parentComment = await Comment.findOne({ commentIDs: comment._id });
            if (parentComment) {
                parentComment.commentIDs = parentComment.commentIDs.filter(id => !id.equals(comment._id));
                await parentComment.save();
            }
            
            await deleteCommentAndReplies(comment._id);
        }
        
        await Community.updateMany(
            { members: user.displayName },
            { $pull: { members: user.displayName } }
        );
        
        await Post.updateMany(
            { "usersVoted.userID": req.params.userId },
            { $pull: { usersVoted: { userID: req.params.userId } } }
        );
        
        await Comment.updateMany(
            { "usersVoted.userID": req.params.userId },
            { $pull: { usersVoted: { userID: req.params.userId } } }
        );
        
        await User.findByIdAndDelete(req.params.userId);
        
        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (err) {
        console.error('Error deleting user and associated data:', err);
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;