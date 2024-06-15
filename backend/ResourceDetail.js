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
    title: String,
    category: String,
    status: [String],
    description: String,
    specialistName: String,
},
{
    collection: "Resource"
});


mongoose.model("resourceCategory", ResourceDetailSchema);
mongoose.model("resourceInfo", ResourceInfoSchema);