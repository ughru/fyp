const mongoose = require("mongoose");


const ForumPostSchema = new mongoose.Schema(
{
    email: { type: String, unique: true},
    description: String,
},
{
    collection: "ForumPost"
});

//This creates a model to interact with database in react native
mongoose.model("forumPost", ForumPostSchema);
