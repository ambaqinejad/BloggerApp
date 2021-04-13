const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const essential = {
    type: String,
    required: true
}
const articleSchema = new Schema({
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Blogger',
        required: true
    },
    title: essential,
    image: {
        ...essential,
        default: 'default.jpg'
    },
    description: essential,
    content: essential,
    htmlContent: essential,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// articleSchema.post('deleteOne', function(doc) {
//     console.log(doc);
// })

module.exports = mongoose.model('Article', articleSchema);