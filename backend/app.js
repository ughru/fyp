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
require('./AppointmentDetail');
require('./Ads');
require('./UserFunctions');

const User = mongoose.model("userInfo");
const Specialist = mongoose.model("specialistInfo");
const Admin = mongoose.model("adminInfo");
const ResourceCategory = mongoose.model("resourceCategory");
const Resource = mongoose.model("resourceInfo");
const ForumPost = mongoose.model('forumPosts');
const ForumComment = mongoose.model('forumComments');
const AdminAd = mongoose.model('adminAd');
const SpecialistAd = mongoose.model('specialistAd');
const WeightLog = mongoose.model('weightLog');
const PeriodLog = mongoose.model('periodLog');
const Personalisation = mongoose.model('personalisation');
const Specialisation = mongoose.model('specialisation');
const SpecialistAppointment = mongoose.model('specialistAppointment');
const Appointment = mongoose.model('appointment');

// Function to get a random sample from an array
function getRandomSample(array, sampleSize) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
}

// for date
const formatDate = (date) => {
  let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
};


// Check db connection status
app.get("/", (req, res) => {
    res.send({status: "Started"})
});

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
      if (email) {
          const userInfo = await User.findOne({ email });
          if (userInfo) {
              res.json(userInfo);
          } else {
              res.status(404).json({ message: 'User not found' });
          }
      } else {
          const users = await User.find(); // Retrieve all users
          if (users.length > 0) {
              res.json({ users });
          } else {
              res.status(404).json({ message: 'No users found' });
          }
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
    if (email) {
      const specialistInfo = await Specialist.findOne({ email });
      if (specialistInfo) {
        res.json(specialistInfo);
      } else {
        res.status(404).json({ message: 'Specialist not found' });
      }
    } else {
      const specialists = await Specialist.find();
      if (specialists.length > 0) {
        res.json({ specialists });
      } else {
        res.status(404).json({ message: 'No specialists found' });
      }
    }
  } catch (error) {
    console.error('Error retrieving specialist info:', error);
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

// edit user profile
app.put('/editUser', async (req, res) => {
    const { email } = req.query;
    const updatedInfo = req.body;

    try {
        const updatedUser = await User.findOneAndUpdate({ email }, updatedInfo, { new: true });
        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/editSpecialist', async (req, res) => {
  const { email } = req.query;
  const updatedInfo = req.body;

  try {
      // Fetch the existing specialist info
      const existingSpecialist = await Specialist.findOne({ email });

      if (!existingSpecialist) {
          return res.status(404).json({ message: 'Specialist not found' });
      }

      // Check if UEN is different
      if (updatedInfo.uen && updatedInfo.uen !== existingSpecialist.uen) {
          updatedInfo.state = 'suspended';
      }

      // Update the specialist info
      const updatedUser = await Specialist.findOneAndUpdate({ email }, updatedInfo, { new: true });

      // If the update includes a name change, update all resources
      if (updatedInfo.firstName || updatedInfo.lastName) {
          const oldSpecialistName = `${existingSpecialist.firstName} ${existingSpecialist.lastName}`;
          const newSpecialistName = `${updatedInfo.firstName || existingSpecialist.firstName} ${updatedInfo.lastName || existingSpecialist.lastName}`;

          await Resource.updateMany(
              { specialistName: oldSpecialistName },
              { $set: { specialistName: newSpecialistName } }
          );
      }

      res.json(updatedUser);
  } catch (error) {
      console.error('Error updating specialist info:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/editAdmin', async (req, res) => {
  const { email } = req.query;
  const updatedInfo = req.body;

  try {
      const updatedUser = await Admin.findOneAndUpdate({ email }, updatedInfo, { new: true });
      if (updatedUser) {
          res.json(updatedUser);
      } else {
          res.status(404).json({ message: 'Admin not found' });
      }
  } catch (error) {
      console.error('Error updating admin info:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// suspend user
app.post('/suspendUser', async (req, res) => {
  const { email } = req.body;

  try {
    // Check in User collection
    let user = await User.findOneAndUpdate({ email }, { state: 'suspended' });
    
    if (!user) {
      // If not found in User collection, check in Specialist collection
      user = await Specialist.findOneAndUpdate({ email }, { state: 'suspended' });
    }

    if (user) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error suspending user:', error);
    res.json({ success: false, error: error.message });
  }
});

// activate user
app.post('/reactivateUser', async (req, res) => {
  const { email } = req.body;

  try {
    // Check in User collection
    let user = await User.findOneAndUpdate({ email }, { state: 'active' });

    if (!user) {
      // If not found in User collection, check in Specialist collection
      user = await Specialist.findOneAndUpdate({ email }, { state: 'active' });
    }

    if (user) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// get specialist's specialisation
app.get('/specialisations', async (req, res) => {
  try {
    const specialisations = await Specialisation.find({});
    res.json(specialisations);
  } catch (error) {
    console.error('Error fetching specialisations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/saveSpecialisation', async (req, res) => {
  const { specialisationName } = req.body;

  // Check if specailisation name already exists
  const existingSpecialisation = await Specialisation.findOne({ specialisationName });

  // If specialisation already exists, return message
  if (existingSpecialisation) {
      return res.status(201).json({ message: 'Specialisation already exists' });
  }

  try {
      // Create new specialisation
      const newSpecialisation = new Specialisation(req.body);

      await newSpecialisation.save();

      res.status(201).json({ message: 'Specialisation saved successfully' });
  } catch (error) {
      console.error('Error saving specialisation:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

/* **********************************************
*************************************************
   REGISTER, LOGIN, LOGOUT, RESET PASSWORD
*************************************************
************************************************/
app.post("/register", async(req, res)=> {
  const {firstName, lastName, status, email, password, state} = req.body;
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
          state, 
      });
      res.send({status: "ok", data:"User Created"})
  } catch (error) {
      res.send({status: "error", data: error})
  }
});

// register specialist
app.post("/registerSpecialist", async(req, res)=> {
  const {firstName, lastName, uen, specialisation, email, password, state} = req.body;
  const oldUser = await Specialist.findOne({email: email});

  if(oldUser) {
      return res.send({data: "Specialist already exists!"});
  }

  try {
      // hashed password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      await Specialist.create({
          firstName: firstName,
          lastName: lastName,
          uen,
          specialisation,
          email: email,
          password: hashedPassword,
          state, 
      });

      res.send({status: "ok", data:"Specialist Created"})
  } catch (error) {
      console.error('Error creating specialist:', error.message);
      res.send({status: "error", data: error.message})
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
      // Check user in User collection
      let user = await User.findOne({ email });
      if (user && user.state === "suspended") {
        return res.send({ error: "Suspended account", type: "user" });
      } else if (user && await bcrypt.compare(password, user.password)) {
        return res.send({ status: "ok", type: "user" });
      }

    // Check user in Specialist collection
    user = await Specialist.findOne({ email });
    if (user && user.state === "suspended") {
      return res.send({ error: "Suspended account", type: "specialist" });
    } else if (user && await bcrypt.compare(password, user.password)) {
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

// Create a new category (admin/specialist)
app.post('/addCategory', async (req, res) => {
  const { categoryName } = req.body;
  try {
    const newCategory = new ResourceCategory({ categoryName });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: 'Error creating category' });
  }
});

// Update category
app.put('/updateCategory', async (req, res) => {
  const { oldCategoryName, newCategoryName } = req.body;

  try {
    // Find and update the category in MongoDB
    const updatedCategory = await ResourceCategory.findOneAndUpdate(
      { categoryName: oldCategoryName },
      { $set: { categoryName: newCategoryName } },
      { new: true }
    );

    // Update category name for associated resources
    await Resource.updateMany(
      { category: oldCategoryName },
      { $set: { category: newCategoryName } }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete category by name (Admin only)
app.delete('/deleteCategory', async (req, res) => {
  const { categoryName } = req.body;

  try {
    const category = await ResourceCategory.findOneAndDelete({ categoryName });
    
    if (!category) {
      return res.status(404).send({ message: 'Category not found' });
    }

    res.send({ message: 'Category deleted successfully' });
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
  const { title, category, status, weekNumber, description, specialistName, imageUrl } = req.body;

  try {
    const existingResource = await Resource.findOne({ title });

    // check if title exist
    if (existingResource) {
      return res.send({ error: "Resource with the same title already exists!" });
    }

    // Check if weekNumber exists for "Pregnancy Summary" category
    if (category === 'Pregnancy Summary') {
      const existingWeekResource = await Resource.findOne({ category, weekNumber });
      if (existingWeekResource) {
          return res.send({ error: "Resource for this week already exists!" });
      }
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
      weekNumber,
      description,
      specialistName,
      imageUrl,
    });

    res.send({ status: "ok", data: "Resource created successfully." });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).send({ status: "error", data: error.message });
  }
});

// Update resource by ID
app.put('/updateresource', async (req, res) => {
  const { resourceID, title, category, status, weekNumber, description, specialistName, imageUrl } = req.body;

  try {
    const updatedResource = await Resource.findOneAndUpdate(
      { resourceID },
      { title, category, status, weekNumber, description, specialistName, imageUrl },
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
// use email in post -> get firstname and lastname in userinfo 
app.get('/getForumPosts', async (req, res) => {
  try {
    const forumPosts = await ForumPost.find().sort({ dateCreated: -1 });

    const forumPostsWithUserInfo = await Promise.all(forumPosts.map(async (post) => {
      const user = await User.findOne({ email: post.userEmail });
      const specialist = await Specialist.findOne({ email: post.userEmail });
      const userInfo = user || specialist || {};

      const comments = await ForumComment.findOne({ postID: post.postID });
      const commentCount = comments ? comments.comments.length : 0;

      return {
        ...post.toObject(),
        commentCount: commentCount,
        userInfo: {
          firstName: userInfo.firstName || '',
          lastName: userInfo.lastName || '',
          email: userInfo.email || ''
        }
      };
    }));

    res.send({ status: 'ok', forumPosts: forumPostsWithUserInfo });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).send({ status: 'error', error: 'Internal server error' });
  }
});

// Get comments for a forum post
// use email in comments -> get firstname and lastname in userinfo 
app.get('/getComments', async (req, res) => {
  const { postID } = req.query;

  try {
    const forumComment = await ForumComment.findOne({ postID });

    if (forumComment) {
      const commentsWithUserInfo = await Promise.all(forumComment.comments.map(async (comment) => {
        const user = await User.findOne({ email: comment.userEmail });
        const specialist = await Specialist.findOne({ email: comment.userEmail });
        const userInfo = user || specialist || {};

        return {
          ...comment.toObject(),
          userInfo: {
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || '',
            email: userInfo.email || ''
          }
        };
      }));

      res.send({ status: 'ok', comments: commentsWithUserInfo });
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

// Delete a comment
app.delete('/deleteComment', async (req, res) => {
  const { postID, commentID } = req.query; 

  try {
    // Find the forum comment by postID
    const forumComment = await ForumComment.findOne({ postID: parseInt(postID) });

    if (!forumComment) {
      return res.status(404).send({ status: 'error', error: 'Forum post not found' });
    }

    // Find the index of the comment in the comments array
    const commentIndex = forumComment.comments.findIndex(comment => comment._id.toString() === commentID);

    if (commentIndex === -1) {
      return res.status(404).send({ status: 'error', error: 'Comment not found' });
    }

    // Remove the comment from the comments array
    forumComment.comments.splice(commentIndex, 1);

    // Save the updated forum comment
    await forumComment.save();

    res.send({ status: 'ok', message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).send({ status: 'error', error: 'Failed to delete comment' });
  }
});

/* **********************************************
*************************************************
   USER FUNCTIONS
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

// add weight log
app.post('/weightLog', async (req, res) => {
  try {
      const { userEmail, record } = req.body;

      // Check if the user already has a weight log
      let weightLog = await WeightLog.findOne({ userEmail });

      // Find the highest weightLogID currently in the database
      const latestLog = await WeightLog.findOne().sort({ weightLogID: -1 });
      let weightLogID = 1;

      if (latestLog) {
          weightLogID = latestLog.weightLogID + 1;
      }

      if (!weightLog) {
          // Create a new weight log
          weightLog = new WeightLog({
              weightLogID,
              userEmail,
              record: [{
                  ...record,
                  difference: '-' // No previous log, so difference is '-'
              }],
          });
      } else {
        if (weightLog.record.length > 0) {
          const existingLogs = weightLog.record || [];
          const currentDate = new Date().toISOString().split('T')[0]; // Current date
  
          // Check if there's already a record for the same date
          const logExists = existingLogs.some(r => {
            const logDate = r.date.toISOString().split('T')[0];
            return logDate === currentDate;
          });
  
          if (logExists) {
            return res.status(400).json({ message: "Weight log for today already exists!" });
          }
          const recentWeight = weightLog.record[weightLog.record.length - 1].weight;
          const difference = record.weight - recentWeight;

          // Append the new record to the existing weight log with difference
          weightLog.record.push({
              ...record,
              difference: `${difference > 0 ? '+' : ''}${difference}` // Store difference with + or -
          });
        } else {
            // No existing records, so difference is '-'
            weightLog.record.push({
                ...record,
                difference: '-' // Store difference with -
            });
        }
      }

      // Save the weight log to the database
      await weightLog.save();

      res.status(201).json({ message: 'Weight Log successfully created!', weightLog });
  } catch (error) {
      res.status(500).json({ message: 'Failed to create Weight Log.', error });
  }
});

// get weight log (display)
// find today's date or earliest record
app.get('/recentLog', async (req, res) => {
  try {
      const { userEmail } = req.query;

      if (!userEmail) {
          return res.status(400).json({ message: 'User email is required.' });
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      let weightLog = await WeightLog.findOne({
          userEmail,
          'record.date': { $gte: startOfDay, $lt: endOfDay }
      }, {
          'record.$': 1
      });

      if (!weightLog) {
          // If no log found for today, find the most recent log before today
          weightLog = await WeightLog.findOne({
              userEmail,
              'record.date': { $lt: startOfDay }
          }, {
              'record.$': 1
          }).sort({ 'record.date': -1 });

          if (!weightLog) {
              // If still not found, find the earliest log
              weightLog = await WeightLog.findOne({
                  userEmail
              }, {
                  'record.$': 1
              }).sort({ 'record.date': 1 });
          }
      }

      if (!weightLog) {
          return res.status(404).json({ message: 'No weight log found.' });
      }

      res.status(200).json(weightLog.record[0]);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch weight log.', error });
  }
});

// get all weight logs for user
app.get('/allWeightLogs', async (req, res) => {
  try {
      const { userEmail } = req.query;

      if (!userEmail) {
          return res.status(400).json({ message: 'User email is required.' });
      }

      const weightLogs = await WeightLog.find({ userEmail });

      if (!weightLogs.length) {
          return res.status(404).json({ message: 'No weight logs found.' });
      }

      res.status(200).json(weightLogs);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch weight logs.', error });
  }
});

// update a weight log (based on date, user)
app.put('/updateWeightLog', async (req, res) => {
  const { userEmail, date, height, weight, bmi, category } = req.body;

  // Check for missing fields
  if (!userEmail || !date || !height || !weight || !bmi || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    let recent = await WeightLog.findOne({ userEmail });
    let firstRecord = await WeightLog.findOne({ userEmail, 'record.date': date });

    let difference = '-';
    if (recent && firstRecord && recent.record[0].date.toString() === firstRecord.record[0].date.toString()) {
      difference = '-';
    } else {
      const recentWeight = recent.record[0].weight;
      difference = weight - recentWeight;
    }
    
    // Find and update the weight log by user email and date
    const weightLog = await WeightLog.findOneAndUpdate(
      { userEmail: userEmail, 'record.date': date },
      {
        $set: {
          'record.$.height': parseFloat(height),
          'record.$.weight': parseFloat(weight),
          'record.$.difference': `${difference > 0 ? '+' : ''}${difference}`,
          'record.$.bmi': parseFloat(bmi),
          'record.$.category': category
        }
      },
      { new: true }
    );

    if (!weightLog) {
      return res.status(404).json({ message: 'Weight log not found' });
    }

    res.status(200).json({ message: 'Weight log updated successfully', weightLog });
  } catch (error) {
    console.error('Error updating weight log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete a weight log (based on date, user)
app.delete('/deleteWeightLog', async (req, res) => {
  const { userEmail, date } = req.body;
  
  try {
      const result = await WeightLog.updateOne(
          { userEmail },
          { $pull: { record: { date: new Date(date) } } }
      );

      if (result.nModified === 0) {
          return res.status(404).send('Weight log not found');
      }

      res.send('Weight log deleted');
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
});

// create a period log
// 1 periodLogID = 1 user for a month and year i.e. user 1,  July 2024 / user 1, August 2024.
// for same month, year / periodLogID and user, adds on to the record [].
// for each month, no repeated dates.
app.post('/periodLog', async (req, res) => {
  const { userEmail, date, record } = req.body;

  if (!userEmail || !date || !record) {
    return res.status(400).json({ msg: 'Please include userEmail, date, and record' });
  }

  try {
    record.date = formatDate(record.date);

    // Check if a period log with userEmail and date (month-year) already exists
    let periodLog = await PeriodLog.findOne({ userEmail, date });

    if (!periodLog) {
      // If no existing log, create a new one
      periodLog = new PeriodLog({
        userEmail,
        date,
        record: [record],
      });
    } else {
      // If log already exists, check if record.date already exists in the log for this userEmail
      const existingRecord = periodLog.record.find((log) => log.date === record.date);

      if (existingRecord) {
        return res.status(400).json({ msg: `Record for date ${record.date} already exists for this user` });
      }

      // Add the new record to the existing log
      periodLog.record.push(record);
    }

    // Save the updated or new period log to the database
    await periodLog.save();
    res.status(201).json({ msg: 'Period Log successfully created or updated', periodLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get period log
app.get('/getPeriodLogMonth', async (req, res) => {
  const { userEmail, date } = req.query;

  if (!userEmail || !date) {
    return res.status(400).json({ msg: 'Please provide userEmail and date' });
  }

  try {
    const periodLogs = await PeriodLog.find({ userEmail, date });

    // Return an empty array if no records are found
    res.json(periodLogs || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// get all period logs for a user
// no need to specify by month
app.get('/allPeriodLog', async (req, res) => {
  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ msg: 'Please provide userEmail' });
  }

  try {
    const periodLogs = await PeriodLog.find({ userEmail });

    // Return an empty array if no records are found
    res.json(periodLogs || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// update period log

app.put('/updatePeriodLog', async (req, res) => {
  const { userEmail, date, record } = req.body;

  if (!userEmail || !date || !record) {
    return res.status(400).json({ msg: 'Please include userEmail, date, and record' });
  }

  try {
    record.date = formatDate(record.date);

    // Check if a period log with userEmail and date (month-year) already exists
    let periodLog = await PeriodLog.findOne({ userEmail, date });

    if (!periodLog) {
      return res.status(404).json({ msg: 'Period Log not found' });
    }

    // Find the index of the existing record to update
    const existingRecordIndex = periodLog.record.findIndex((log) => log.date === record.date);

    if (existingRecordIndex !== -1) {
      // Update the existing record
      periodLog.record[existingRecordIndex].flowType = record.flowType;
      periodLog.record[existingRecordIndex].symptoms = record.symptoms;
      periodLog.record[existingRecordIndex].mood = record.mood;
    } else {
      return res.status(404).json({ msg: 'Record not found in Period Log' });
    }

    // Save the updated period log to the database
    await periodLog.save();

    res.status(200).json({ msg: 'Period Log successfully updated', periodLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* **********************************************
*************************************************
   ADVERTISEMENTS
*************************************************
************************************************/
// Get all admin ads
app.get('/getAdminAds', async (req, res) => {
  const { userEmail } = req.query;
  if (!userEmail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Retrieve resources from the database based on the email
    const adminAd = await AdminAd.find({ userEmail });

    if (adminAd.length > 0) {
      res.json(adminAd);
    } else {
      res.status(404).json({ message: 'Ad by admin not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving ads', error: err.message });
  }
});

// Admin create Ad
app.post("/createAd", async (req, res) => {
  const { userEmail, title, company, type, description, imageUrl } = req.body;

  try {
    // Check if ad with the same title already exists
    const existingAd = await AdminAd.findOne({ title });

    if (existingAd) {
      return res.status(400).json({ error: 'Ad with the same title already exists!' });
    }

    // Find the highest adID currently in the database
    const latestAd = await AdminAd.findOne().sort({ adID: -1 });
    let adID = 1;

    if (latestAd) {
      adID = latestAd.adID + 1;
    }

    // Create new ad document
    const newAd = new AdminAd({
      adID,
      userEmail,
      title,
      company,
      type, 
      description,
      imageUrl,
      dateCreated: new Date(),
    });

    // Save the ad to the database
    await newAd.save();

    res.status(201).json({ status: 'ok', data: 'Ad created successfully.' });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ status: 'error', data: error.message });
  }
});

// Get all specialist ads
app.get('/getSpecialistAds', async (req, res) => {
  const { userEmail } = req.query;
  if (!userEmail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
      // Retrieve all resources from the database
      const ad = await SpecialistAd.find({userEmail});

      if (ad.length > 0) {
        res.json(ad);
      } else {
        res.status(404).json({ message: 'Ad by specialist not found' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving ads', error: err.message });
    }
});

// Specialist create Ad
app.post("/specialistCreateAd", async (req, res) => {
  const { userEmail, title, company, description, imageUrl } = req.body;

  try {
    // Find the highest adID currently in the database
    const latestAd = await SpecialistAd.findOne().sort({ adID: -1 });
    let adID = 1;

    if (latestAd) {
      adID = latestAd.adID + 1;
    }

    // Create new ad document
    const newAd = new SpecialistAd({
      adID,
      userEmail,
      title,
      company,
      description,
      imageUrl,
      dateCreated: new Date(),
    });

    // Save the ad to the database
    await newAd.save();

    res.status(201).json({ status: 'ok', data: 'Ad created successfully.' });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ status: 'error', data: error.message });
  }
});

// Get add by id
app.get('/getAd', async (req, res) => {
  try {
    const adId = req.query.adID;
    const ad = await AdminAd.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.json(ad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Admin delete an ad based on id
app.delete('/deleteAd', async (req, res) => {
  const adId = req.query.adID; // adID passed as a number

  try {
    const deletedAd = await AdminAd.findOneAndDelete({ adID: adId });

    if (deletedAd) {
      res.json({ status: 'ok', message: 'Ad deleted successfully' });
    } else {
      res.status(404).json({ status: 'error', message: 'Ad not found' });
    }
  } catch (err) {
    console.error('Error deleting ad:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Specialist delete ad by id
app.delete('/deleteSpecialistAd', async (req, res) => {
  const adId = req.query.adID; // adID passed as a number

  try {
    const deletedAd = await SpecialistAd.findOneAndDelete({ adID: adId });

    if (deletedAd) {
      res.json({ status: 'ok', message: 'Ad deleted successfully' });
    } else {
      res.status(404).json({ status: 'error', message: 'Ad not found' });
    }
  } catch (err) {
    console.error('Error deleting ad:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

/* **********************************************
*************************************************
   APPOINTMENTS
*************************************************
************************************************/
//get appointment
app.get('/getAppointments', async (req, res) => {
  const { userEmail, date } = req.query;

  if (!userEmail || !date) {
    return res.status(400).json({ msg: 'Please provide userEmail and date' });
  }

  try {
    const appointment = await SpecialistAppointment.find({ userEmail, date });

    // Return an empty array if no records are found
    res.json(appointment || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// add appointment (specialist)
app.post('/appointments', async (req, res) => {
  const { userEmail, date, appointment } = req.body;

  try {
    // Find if an appointment document with the same userEmail and date already exists
    const existingAppointment = await SpecialistAppointment.findOne({ userEmail, date });

    if (existingAppointment) {
      // If an existing document is found, push the new appointment into the appointment array
      existingAppointment.appointment.push(...appointment);
      const updatedAppointment = await existingAppointment.save();
      res.status(201).json(updatedAppointment);
    } else {
      // If no existing document is found, create a new appointment instance
      const newAppointment = new SpecialistAppointment({
        userEmail,
        date,
        appointment,
      });

      // Save the new appointment document to the database
      const savedAppointment = await newAppointment.save();
      res.status(201).json(savedAppointment);
    }
  } catch (error) {
    console.error('Error saving appointment:', error);
    res.status(500).json({ error: 'Error saving appointment' });
  }
});

/* **********************************************
*************************************************
   PERSONALISATION
*************************************************
************************************************/
app.post("/personalise", async(req, res)=> {
  const {userEmail, personalisation} = req.body;
  
  try {
    const latestRecord = await Personalisation.findOne().sort({ idNo: -1 });
    let idNo = 1;

    if (latestRecord) {
      idNo = latestRecord.idNo + 1;
    }

    await Personalisation.create({
      userEmail: userEmail,
      personalisation,
    });
    res.send({status: "ok", data:"Personalisation data recorded"})

  } catch (error) {
    res.send({status: "error", data: error})
}
});

app.get("/getPersonalisation", async(req, res)=> {
  const {userEmail} = req.query;
  
  try {
    const personalisationData = await Personalisation.findOne({ userEmail });

    if (!personalisationData) {
      return res.status(404).json({ error: 'Personalisation data not found' });
    }

    res.json(personalisationData);
  } catch (error) {
    console.error('Error retrieving personalisation data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(5001, ()=> {
    console.log("Node js server started.");
});