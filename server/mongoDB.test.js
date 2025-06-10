const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./test-server'); 
const Post = require('./models/posts');
const Comment = require('./models/comments');
const Community = require('./models/communities');

describe('MongoDB Post Deletion Tests', () => {
  beforeAll(async () => {
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
      }
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test('should delete post and all its comments using delete route', async () => {
    const community = new Community({
      name: 'Test Community',
      description: 'A test community',
      creator: 'testuser',
      members: ['testuser']
    });
    await community.save();
    const post = new Post({
      title: 'Test Post',
      content: 'This is a test post',
      postedBy: 'testuser'
    });
    await post.save();

    community.postIDs.push(post._id);
    await community.save();


    const comment1 = new Comment({
      content: 'First comment',
      commentedBy: 'user1'
    });
    await comment1.save();

    const comment2 = new Comment({
      content: 'Second comment',
      commentedBy: 'user2'
    });
    await comment2.save();

    const reply1 = new Comment({
      content: 'Reply to first comment',
      commentedBy: 'user3'
    });
    await reply1.save();

    const nestedReply = new Comment({
      content: 'Nested reply',
      commentedBy: 'user4'
    });
    await nestedReply.save();

    comment1.commentIDs.push(reply1._id);
    reply1.commentIDs.push(nestedReply._id);
    
    await comment1.save();
    await reply1.save();

    post.commentIDs.push(comment1._id, comment2._id);
    await post.save();

    const collectAllCommentIds = async (commentIds) => {
      let allIds = [];
      for (const commentId of commentIds) {
        allIds.push(commentId.toString());
        const comment = await Comment.findById(commentId);
        if (comment && comment.commentIDs.length > 0) {
          const nestedIds = await collectAllCommentIds(comment.commentIDs);
          allIds = allIds.concat(nestedIds);
        }
      }
      return allIds;
    };

    const allCommentIds = await collectAllCommentIds(post.commentIDs);
    const postId = post._id.toString();

    const deleteResponse = await request(app)
      .delete(`/api/posts/${postId}`)
      .expect(200);

    expect(deleteResponse.body.message).toMatch(/deleted/i);

    const deletedPost = await Post.findById(postId);
    expect(deletedPost).toBeNull();

    for (const commentId of allCommentIds) {
      const deletedComment = await Comment.findById(commentId);
      expect(deletedComment).toBeNull();
    }

    const updatedCommunity = await Community.findById(community._id);
    expect(updatedCommunity.postIDs).not.toContain(postId);
  });
});