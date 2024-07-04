const mongoose = require("mongoose");

const AdminAdSchema = new mongoose.Schema(
{
    adID: {type: Number},
    userEmail: {type: String},
    title: {type: String},
    company: {type: String},
    description: {type: String},
    imageUrl: {type: String},
    dateCreated: {type: Date},
},
{
    collection: "AdminAd"
});

const SpecialistAdSchema = new mongoose.Schema(
    {
        adID: {type: Number},
        userEmail: {type: String},
        title: {type: String},
        type: {type: String},
        description: {type: String},
        imageUrl: {type: String},
        dateCreated: {type: Date},
    },
    {
        collection: "SpecialistAd"
    });

mongoose.model("adminAd", AdminAdSchema);
mongoose.model("specialistAd", SpecialistAdSchema);