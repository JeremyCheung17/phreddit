// LinkFlair Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var linkFlairSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            maxLength: 30
        },
    }
);

linkFlairSchema.virtual('url').get(function() {
    return `linkFlairs/${this._id}`;
});

module.exports = mongoose.model('LinkFlair', linkFlairSchema);