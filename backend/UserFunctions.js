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

const PeriodLogSchema = new mongoose.Schema(
{
    periodLogID: {type: Number},
    userEmail: {type: String},
    date: {type: String}, // specific month and year
    record: [
    {
        date: {type: String}, // save as yyyy-mm-dd
        flowType: {type: String},
        symptoms: [{type: String}], // array of strings
        mood: {type: String},
    }
    ]
},
{
    collection: "PeriodLog"
});

mongoose.model("weightLog", WeightLogSchema);
mongoose.model("periodLog", PeriodLogSchema);