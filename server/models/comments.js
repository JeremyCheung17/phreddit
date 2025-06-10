// Comment Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            maxLength: 500
        },
        commentIDs: [{
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }],
        commentedBy: {
            type: String,
            required: true,
        },
        commentedDate: {
            type: Date,
            default: Date.now,
            required: true
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
    }
);

commentSchema.virtual('url').get(function() {
    return `comments/${this._id}`;
});

module.exports = mongoose.model('Comment', commentSchema);