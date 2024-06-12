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
const ForumReport = mongoose.model('forumReports');
const Counter = mongoose.model('counter');

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
app.get('/resource', async (req, res) => {
  try {
    // Retrieve all resources from the database
    const resources = await Resource.find({});

    // Sort the resources alphabetically based on their titles
    const sortedResources = resources.sort((a, b) => a.title.localeCompare(b.title));

    // Send the sorted resources as a response
    res.json(sortedResources);
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

// specialist creates a resource
app.post("/addresource", async (req, res) => {
  const { title, category, status, description, specialistName } = req.body;

  try {
      const existingResource = await Resource.findOne({ title });

      if (existingResource) {
          return res.send({ error: "Resource with the same title already exists!" });
      }

      await Resource.create({
          title,
          category,
          status,
          description,
          specialistName
      });

      res.send({ status: "ok", data: "Resource created successfully." });
  } catch (error) {
      res.send({ status: "error", data: error.message });
  }
});

// forum
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
const { postID, currentUser } = req.body;


try {
  const forumReport = new ForumReport({
      postID,
      currentUser
  });

  await forumReport.save();
  res.send({ status: 'ok', forumReport });
} catch (error) {
  console.error('Error reporting post: ', postID)
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
