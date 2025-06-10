// Post Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            maxLength: 100
        },
        content: {
            type: String,
            required: true,
        },
        linkFlairID: {
            type: Schema.Types.ObjectId,
            ref: 'LinkFlair'
        },
        postedBy: {
            type: String,
            required: true,
        },
        postedDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        commentIDs: [{
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }],
        views: {
            type: Number,
            default: 0
        },
        votes: {
            type: Number,
            default: 0
        },
        usersVoted: [{
            userID: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            voteType: {
                type: String,
                enum: ["upvote", "downvote"],
                required: true
            }
        }],
        default: []
    }
);

postSchema.virtual('url').get(function() {
    return `posts/${this._id}`;
});

module.exports = mongoose.model('Post', postSchema);