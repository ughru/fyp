const mongoose = require("mongoose");

const ResourceDetailSchema = new mongoose.Schema(
{
    categoryName: String,
},
{
    collection: "ResourceCategory"
});

const ResourceInfoSchema = new mongoose.Schema(
{
    resourceID: {type: Number},
    title: String,
    category: String,
    status: [String],
    weekNumber: String,
    description: String,
    specialistName: String,
    imageUrl: String,
},
{
    collection: "Resource"
});


mongoose.model("resourceCategory", ResourceDetailSchema);
mongoose.model("resourceInfo", ResourceInfoSchema);