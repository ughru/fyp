const mongoose = require("mongoose");

const WeightLogSchema = new mongoose.Schema(
{
    weightLogID: {type: Number},
    userEmail: {type: String},
    record: [
    {
        date: {type: Date},
        weight: {type: Number},
        height: {type: Number},
        bmi: {type: Number},
        category: {type: String},
    }
    ]
},
{
    collection: "WeightLog"
});

mongoose.model("weightLog", WeightLogSchema);