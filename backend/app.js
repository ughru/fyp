const express = require("express");
const app=express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
app.use(express.json());


const mongoUrl = "mongodb+srv://ru:admin@cluster0.dawierb.mongodb.net/bloom?retryWrites=true&w=majority&appName=Cluster0";


mongoose.connect(mongoUrl).then(()=> {
    console.log("Database Connected.");
})
.catch((e)=>{
    console.log(e);
})
require('./UserDetails');
const User = mongoose.model("userInfo");
//const ForumPost = mongoose.model("forumPost")
const ForumPost = require('./ForumPost');


app.get("/", (req, res) => {
    res.send({status: "Started"})
});


app.post("/register", async(req, res)=> {
    const {firstName, lastName, type, email, password} = req.body;


    const oldUser = await User.findOne({email: email});


    if(oldUser) {
        return res.send({data: "User already exists!"});
    }


    try {
        // hashed password before storing
        const hashedPassword = await bcrypt.hash(password, 10);


        await User.create({
            firstName: firstName,
            lastName: lastName,
            type,
            email: email,
            password: hashedPassword,
        });
        res.send({status: "ok", data:"User Created"})
    } catch (error) {
        res.send({status: "error", data: error})
    }
});


app.post("/login", async (req, res) => {
    const { email, password } = req.body;
 
    try {
        const user = await User.findOne({ email });


        if (!user) {
        return res.send({ error: "User does not exist!" });
        }


        // check if password matches that in db
        const passwordMatch = await bcrypt.compare(password, user.password);


        if (!passwordMatch) {
            return res.send({ error: "Invalid password" });
        }


        res.send({ status: "ok" });
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
});


app.post("/logout", (req, res) => {
    // Perform logout actions (e.g., clear session, etc.)
    // Respond with success message or appropriate status code
    res.send({ message: "Logout successful" });
});

//Create forum post
// server.js or index.js
/*
app.post("/createForumPost", async (req, res) => {
    const { token, description } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({ uid: decodedToken.uid });

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const newForumPost = new ForumPost({
            description,
            user: user._id,
        });

        await newForumPost.save();
        res.send({ status: "ok", forumPost: newForumPost });
    } catch (error) {
        console.error("Error creating forum post:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});
*/
app.post('/createForumPost', async (req, res) => {
    const { user, description } = req.body;

    try {
        const forumPost = new ForumPost({
            user,
            description
        });

        await forumPost.save();
        res.send({ status: 'ok', forumPost });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error creating forum post' });
    }
});


//Get forum post
/*
app.get("/getForumPosts", async (req, res) => {
    try {
        const forumPosts = await ForumPost.find().populate('user', 'email');
        res.send({ status: "ok", forumPosts });
    } catch (error) {
        console.error("Error fetching forum posts:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});
*/
app.get('/getForumPosts', async (req, res) => {
    try {
        const forumPosts = await ForumPost.find().sort({ date: -1 });
        res.send({ status: 'ok', forumPosts });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error fetching forum posts' });
    }
});


app.listen(5001, ()=> {
    console.log("Node js server started.");
});
