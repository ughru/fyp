const mongoose = require("mongoose");
//const { ref } = require("firebase/database");


const ForumPostSchema = new mongoose.Schema(
{
    //email: { type: String, unique: true}, required: true,
    //user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    postID: {type: Number, required: true},
    user: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    comments: {type: Array, default: []}
    
},
{
    //timestamps: true,
    collection: "ForumPost"
});

//This creates a model to interact with database in react native
//mongoose.model("forumPost", ForumPostSchema);
/*
const ForumPost = mongoose.model('forumPost', ForumPostSchema);

module.exports = ForumPost;
*/

module.exports = mongoose.model("forumPost", ForumPostSchema);