const mongoose = require("mongoose");
//const { ref } = require("firebase/database");


const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    count: { type: Number, default: 0 }
});

const ForumPostSchema = new mongoose.Schema(
{
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

const ForumCommentSchema = new mongoose.Schema(
{
    postID: {type: Number, required: true},
    comments: [
        {
        user: { type: String, required: true },
        userComment: { type: String, required: true },
        date: { type: Date, default: Date.now }
        }
    ]
},
{
    timestamps: true,
    collection: "ForumComment"
});

const ForumReportSchema = new mongoose.Schema(
{
    postID: { type: Number, required: true },
    currentUser: {type: String, required: true},
    date: { type: Date, default: Date.now }
},
{
    timestamps: true,
    collection: "ForumReport"
});

mongoose.model("counter", CounterSchema);
mongoose.model("forumPosts", ForumPostSchema);
mongoose.model("forumComments", ForumCommentSchema);
mongoose.model("forumReports", ForumReportSchema);