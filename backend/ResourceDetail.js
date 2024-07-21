const mongoose = require("mongoose");

const ResourceDetailSchema = new mongoose.Schema(
{
    categoryName: {type: String},
},
{
    collection: "ResourceCategory"
});

const ResourceInfoSchema = new mongoose.Schema(
{
    resourceID: {type: Number},
    title: {type: String},
    category: {type: String},
    status: [String],
    weekNumber: {type: String},
    description: {type: String},
    specialistName: {type: String},
    imageUrl: {type: String},
    bmi: [String],
},
{
    collection: "Resource"
});


mongoose.model("resourceCategory", ResourceDetailSchema);
mongoose.model("resourceInfo", ResourceInfoSchema);