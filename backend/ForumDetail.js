const mongoose = require("mongoose");

const ForumPostSchema = new mongoose.Schema(
{
    postID: {type: Number},
    userEmail: {type: String},
    category: {type: String},
    description: {type: String},
    dateCreated: {type: Date},
    dateUpdated: {type: Date, default: null},
},
{
    collection: "ForumPost"
});

const ForumCommentSchema = new mongoose.Schema(
{
    postID: {type: Number},
    comments: [
        {
            userEmail: { type: String},
            userComment: {type: String},
            date: {type: Date}
        }
    ]
},
{
    collection: "ForumComment"
});

mongoose.model("forumPosts", ForumPostSchema);
mongoose.model("forumComments", ForumCommentSchema);