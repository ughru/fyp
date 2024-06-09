const mongoose = require("mongoose");
//const { ref } = require("firebase/database");


const ForumCommentSchema = new mongoose.Schema(
{
    //email: { type: String, unique: true}, required: true,
    //user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
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

//This creates a model to interact with database in react native
//mongoose.model("forumPost", ForumPostSchema);

module.exports = mongoose.model("forumComment", ForumCommentSchema);