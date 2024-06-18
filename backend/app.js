const cors = require('cors');
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

// Import required collections 
require('./UserDetails');
require('./ResourceDetail');
require('./ForumDetail');

const User = mongoose.model("userInfo");
const Specialist = mongoose.model("specialistInfo");
const Admin = mongoose.model("adminInfo");
const ResourceCategory = mongoose.model("resourceCategory");
const Resource = mongoose.model("resourceInfo");
const ForumPost = mongoose.model('forumPosts');
const ForumComment = mongoose.model('forumComments');

// Function to get a random sample from an array
function getRandomSample(array, sampleSize) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
}


// Check db connection status
/*
app.get("/", (req, res) => {
    res.send({status: "Started"})
});
*/

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

/* **********************************************
*************************************************
  USER INFORMATION
*************************************************
************************************************/
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

// get specialist info 
app.get('/specialistinfo', async (req, res) => {
  const { email } = req.query;

  try {
    const specialistInfo = await Specialist.findOne({ email }); 
    if (specialistInfo) {
      res.json(specialistInfo);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// get admininfo 
app.get('/admininfo', async (req, res) => {
  const { email } = req.query;

  try {
    const adminInfo = await Admin.findOne({ email }); 
    if (adminInfo) {
      res.json(adminInfo);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// get user and specialist info in one
// combination of 2 tables to get user information of comments (forum)
app.get('/getUserInfo', async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    const specialist = await Specialist.findOne({ email });

    if (user || specialist) {
      res.send({
        status: 'ok',
        data: user || specialist,
        userType: user ? 'User' : 'Specialist'
      });
    } else {
      res.send({ status: 'error', error: 'User not found' });
    }
  } catch (error) {
    res.status(500).send({ status: 'error', error: 'Error fetching user info' });
  }
});

/* **********************************************
*************************************************
   REGISTER, LOGIN, LOGOUT, RESET PASSWORD
*************************************************
************************************************/
app.post("/register", async(req, res)=> {
  const {firstName, lastName, status, email, password} = req.body;


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
      // Check user in User collection
      let user = await User.findOne({ email });
      if (user && await bcrypt.compare(password, user.password)) {
          return res.send({ status: "ok", type: "user" });
      }

    // Check user in Specialist collection
    user = await Specialist.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        return res.send({ status: "ok", type: "specialist" });
    }

    // Check user in Admin collection
    user = await Admin.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        return res.send({ status: "ok", type: "admin" });
    }

      // If no user is found in any collection
      res.send({ error: "Invalid email or password" });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send({ error: "Internal server error" });
  }
});

app.post("/logout", (req, res) => {
    res.send({ message: "Logout successful" });
});

// reset password
app.post('/resetpassword', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
      // Find the user by email in the User collection
      let user = await User.findOne({ email });

      // If user not found in the User collection, find in the Specialist collection
      if (!user) {
        user = await Specialist.findOne({ email });
      }

      // If user not found in the Specialist collection, find in the Admin collection
      if (!user) {
        user = await Admin.findOne({ email });
      }

      // If user not found in any collection, return error
      if (!user) {
        return res.send({ error: "* User does not exist" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Update the user's password
      user.password = hashedPassword;

      // Save the updated user
      await user.save();

      // Password successfully reset
      return res.json({ message: 'Password reset successfully' });
  } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
});

/* **********************************************
*************************************************
   RESOURCE HUB
*************************************************
************************************************/
// get categories
// 1st element: "All", aplhebetically ordered the rest for display
app.get('/categories', async (req, res) => {
  try {
    // Retrieve all categories from the database
    const categories = await ResourceCategory.find({});

    // Separate the first category from the rest
    const firstCategory = categories.shift();

    // Sort the remaining categories alphabetically
    const sortedCategories = categories.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    // Combine the first category and the sorted list of categories
    const orderedCategories = [firstCategory, ...sortedCategories];

    // Send the ordered categories as a response
    res.json(orderedCategories);
  } catch (err) {
    res.status(500).send(err);
  }
});


// get resources, alphabetically sorted
// GET all resources and count
app.get('/resource', async (req, res) => {
  try {
      // Retrieve all resources from the database
      const resources = await Resource.find({});

      // Sort the resources alphabetically based on their titles
      const sortedResources = resources.sort((a, b) => a.title.localeCompare(b.title));

      // Get the count of resources
      const resourceCount = resources.length;

      // Send response with sorted resources and count
      res.json({ resources: sortedResources, count: resourceCount });
  } catch (err) {
      res.status(500).send(err);
  }
});


// Get 10 resources
app.get('/resourceReco', async (req, res) => {
  try {
    const resourceReco = await Resource.find({});
    const randomResources = getRandomSample(resourceReco, 10);
    res.json(randomResources);
  } catch (err) {
    res.status(500).send(err);
  }
});

// specialist creates a resource
app.post('/addresource', async (req, res) => {
  const { title, category, status, description, specialistName } = req.body;

  try {
    const existingResource = await Resource.findOne({ title });

    if (existingResource) {
      return res.send({ error: "Resource with the same title already exists!" });
    }

    // Find the highest resourceID currently in the database
    const latestResource = await Resource.findOne().sort({ resourceID: -1 });
    let resourceID = 1;

    if (latestResource) {
      resourceID = latestResource.resourceID + 1;
    }

    await Resource.create({
      resourceID,
      title,
      category,
      status,
      description,
      specialistName
    });

    res.send({ status: "ok", data: "Resource created successfully." });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).send({ status: "error", data: error.message });
  }
});

// Update resource by ID
app.put('/updateresource', async (req, res) => {
  const { resourceID, title, category, status, description, specialistName } = req.body;

  try {
    const updatedResource = await Resource.findOneAndUpdate(
      { resourceID },
      { title, category, status, description, specialistName },
      { new: true } // Return the updated document
    );

    if (updatedResource) {
      res.json({ status: 'ok', data: updatedResource });
    } else {
      res.status(404).json({ status: 'error', message: 'Resource not found' });
    }
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Delete a resource by ID
app.delete('/deleteresource', async (req, res) => {
  const { resourceID } = req.query;

  try {
    const deletedResource = await Resource.findOneAndDelete({ resourceID });

    if (deletedResource) {
      res.json({ status: 'ok', message: 'Resource deleted successfully' });
    } else {
      res.status(404).json({ status: 'error', message: 'Resource not found' });
    }
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

/* **********************************************
*************************************************
   FORUM
*************************************************
************************************************/
//Get forum post
app.get('/getForumPosts', async (req, res) => {
  try {
      const forumPosts = await ForumPost.find().sort({ dateCreated: -1 });

      const forumPostsWithComments = await Promise.all(forumPosts.map(async (post) => {
            const comments = await ForumComment.findOne({ postID: post.postID });
            const commentCount = comments ? comments.comments.length : 0;
            return {
                ...post.toObject(),
                commentCount: commentCount
            };
        }));

        res.send({ status: 'ok', forumPosts: forumPostsWithComments });
  } catch (error) {
      console.error('Error reporting forum post:', error);
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
});

// Create forum post
app.post('/createForumPost', async (req, res) => {
  const { userEmail, category, description } = req.body;

  try {
      // Find the highest postID currently in the database
      const latestPost = await ForumPost.findOne().sort({ postID: -1 });
      let postID = 1; 

      if (latestPost) {
          postID = latestPost.postID + 1;
      }

      const forumPost = new ForumPost({
          postID,
          userEmail,
          category,
          description,
          dateCreated: new Date(),
      });

      await forumPost.save();
      res.send({ status: 'ok', forumPost });
  } catch (error) {
      console.error('Error creating forum post:', error);
      res.status(500).send({ status: 'error', error: 'Internal server error' });
  }
});

//Add forum comment
app.post('/addComment', async (req, res) => {
  const { postID, userEmail, userComment } = req.body;

  try {
    const forumPostExist = await ForumPost.exists({ postID });

    if (!forumPostExist) {
      return res.status(404).send({ status: 'error', error: 'Forum post does not exist' });
    }

    const updatedComment = await ForumComment.findOneAndUpdate(
      { postID },
      { $push: { comments: { userEmail, userComment, date: new Date() } } },
      { new: true, upsert: true }
    );

    res.send({ status: 'ok', updatedComment });
  } catch (error) {
    console.error('Error adding comment', error);
    res.status(500).send({ status: 'error', error: 'Internal server error' });
  }
});

// update post
app.put('/updatePost', async (req, res) => {
  const { postID, userEmail, category, description } = req.body;

  try {
    const updatedPost = await ForumPost.findOneAndUpdate(
      { postID, userEmail },
      {
        category,
        description,
        dateUpdated: new Date() // Set the current date 
      },
      { new: true } // Return the updated document
    );

    if (updatedPost) {
      res.json({ status: 'ok', data: updatedPost });
    } else {
      res.status(404).json({ status: 'error', message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Delete a post by ID
app.delete('/deletePost', async (req, res) => {
  const { postID } = req.query;

  try {
      // Delete the post
      const deletedPost = await ForumPost.findOneAndDelete({ postID: Number(postID) });

      if (deletedPost) {
          // Delete the comments associated with the post
          await ForumComment.deleteMany({ postID: Number(postID) });

          res.json({ status: 'ok', message: 'Post and associated comments deleted successfully' });
      } else {
          res.status(404).json({ status: 'error', message: 'Post not found' });
      }
  } catch (error) {
      console.error('Error deleting post and comments:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

/* **********************************************
*************************************************
   SETTINGS
*************************************************
************************************************/
// update user's pregnancy status
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

app.listen(5001, ()=> {
    console.log("Node js server started.");
});
