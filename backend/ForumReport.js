const mongoose = require("mongoose");
//const { ref } = require("firebase/database");


const ForumReportSchema = new mongoose.Schema(
{
    //email: { type: String, unique: true}, required: true,
    //user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    postID: { type: Number, required: true },
    currentUserEmail: {type: String, required: true},
    date: { type: Date, default: Date.now }
},
{
    //timestamps: true,
    collection: "ForumReport"
});

//This creates a model to interact with database in react native
//mongoose.model("forumPost", ForumPostSchema);
/*
const ForumPost = mongoose.model('forumPost', ForumPostSchema);

module.exports = ForumPost;
*/

module.exports = mongoose.model("forumReport", ForumReportSchema);