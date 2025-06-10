var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        displayName: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        reputation: {
            type: Number,
            default: 100,
            required: true
        },
        userType: {
            type: String,
            enum: ['user','admin'],
            default: 'user'
        },
        createdDate: {
            type: Date,
            default: Date.now,
            required: true
        }
    }
);

userSchema.virtual('url').get(function() {
    return `user/${this._id}`;
});

module.exports = mongoose.model('User', userSchema);