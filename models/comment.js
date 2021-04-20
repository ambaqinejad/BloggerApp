const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    commentedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Blogger',
        trim: true,
        required: true
    },
    forArticle: {
        type: Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Comment', commentSchema);