// Community Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var communitySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            maxLength: 100
        },
        description: {
            type: String,
            required: true,
            maxLength: 500
        },
        postIDs: [{
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }],
        startDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        members: [{
            type: String,
            required: true
        }],
        creator: {
            type: String,
            required: true
        }
    }
);

communitySchema.virtual('url').get(function() {
    return `communities/${this._id}`;
});

communitySchema.virtual('memberCount').get(function() {
    return this.members.length;
});

module.exports = mongoose.model('Community', communitySchema);