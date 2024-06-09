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
require('./ResourceDetail');

const User = mongoose.model("userInfo");
const ResourceCategory = mongoose.model("resourceCategory");
const Resource = mongoose.model("resourceInfo");
//const ForumPost = mongoose.model("forumPost")
const ForumPost = require('./ForumPost');
const ForumReport = require('./forumReport')
const Counter = require('./Counter')
const ForumComment = require('./ForumComment')

// Check db connection status
app.get("/", (req, res) => {
    res.send({status: "Started"})
});

// get user info 
app.get('/userinfo', async (req, res) => {
    const { email } = req.query;
  
    try {
      const userInfo = await User.findOne({ email }); 
      if (userInfo) {
        res.json(userInfo);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user info:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

// get categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await ResourceCategory.find({});
    res.json(categories);
  } catch (err) {
    res.status(500).send(err);
  }
});

// get resources
app.get('/resource', async (req, res) => {
  try {
    const resource = await Resource.find({});
    res.json(resource);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/register", async(req, res)=> {
    const {firstName, lastName, type, status, email, password} = req.body;


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
            status,
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

app.post('/updateStatus', async (req, res) => {
    const { email, status } = req.body;
  
    try {
      const user = await User.findOneAndUpdate(
        { email },
        { status },
        { new: true } // Return the updated document
      );
  
      if (user) {
        res.json({ message: 'Status updated successfully', status: user.status });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

//Function to create unique postID
async function getNextPostID() {
    try {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'postID' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        return counter.count;
    } catch (error) {
        throw new Error('Error getting next post ID');
    }
}

//Create forum post
app.post('/createForumPost', async (req, res) => {
    const { user, description } = req.body;

    try {
        const postID = await getNextPostID();
        const forumPost = new ForumPost({
            postID,
            user,
            description
        });

        await forumPost.save();
        res.send({ status: 'ok', forumPost });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Internal server error' });
    }
});


//Get forum post
app.get('/getForumPosts', async (req, res) => {
    try {
        const forumPosts = await ForumPost.find().sort({ date: -1 });
        res.send({ status: 'ok', forumPosts });
    } catch (error) {
        console.error('Error reporting forum post:', error);
        res.status(500).send({ status: 'error', error: 'Internal server error' });
    }
});

// Report Post endpoint
app.post('/reportPost', async (req, res) => {
  const { postID, currentUserEmail } = req.body;

  
  try {
    const forumReport = new ForumReport({
        postID,
        currentUserEmail
    });

    await forumReport.save();
    res.send({ status: 'ok', forumReport });
} catch (error) {
    console.error('Error reporting post: ', error)
    res.status(500).send({ status: 'error', error: 'Internal server error' });
}
});

//Add forum comment
app.post('/addComment', async(req, res) => {
  const { postID, user, text } = req.body;

  try{
    //Find forum post by postID
    //let forumComment = await ForumComment.findOne({postID});
    let forumPostExist = await ForumPost.exists({ postID });

    //If forum post does not exist
    if (!forumPostExist) {
      return res.status(404).send({ status: 'error', error: 'Forum post does not exist' });
    }

    // Find forum comment by postID
    let forumComment = await ForumComment.findOne({ postID });

    // If no comments for this post, create a new document
    if (!forumComment) {
      forumComment = new ForumComment({
        postID,
        comments: [{ user, text }]
      });
    } else {
      forumComment.comments.push({ user, text });
    }

    await forumComment.save();
    res.send({ status: 'ok', forumComment });
  }

  catch(error){
    console.error('Error adding comments', error)
    res.status(500).send({ status: 'error', error: 'Internal server error' });
  }
});

// Get comments for a forum post
app.get('/getComments', async (req, res) => {
  const { postID } = req.query;

  try {
      const forumComment = await ForumComment.findOne({ postID });

      if (forumComment) {
          res.send({ status: 'ok', comments: forumComment.comments });
      } else {
          res.send({ status: 'ok', comments: [] });
      }
  } catch (error) {
      res.status(500).send({ status: 'error', error: 'Error fetching comments' });
  }
})


app.listen(5001, ()=> {
    console.log("Node js server started.");
});
