const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema(
{
    firstName: { type: String },
    lastName: { type: String },
    status: { type: String },
    contact: {type: String},
    email: { type: String, unique: true },
    password: { type: String },
    state: { type: String },
},
{
    collection: "UserInfo"
});

mongoose.model("userInfo", UserDetailSchema);

const SpecialistDetailSchema = new mongoose.Schema(
{
    firstName: { type: String },
    lastName: { type: String },
    uen: { type: String },
    contact: {type: String},
    specialisation: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    state: { type: String },
},
{
    collection: "SpecialistInfo"
});

mongoose.model("specialistInfo", SpecialistDetailSchema);

const SpecialisationSchema = new mongoose.Schema(
{
    specialisationName: { type: String, required: true, unique: true },
},
{
    collection: "Specialisation"
});

const AdminDetailSchema = new mongoose.Schema(
{
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    state: String,
},
{
    collection: "AdminInfo"
});

mongoose.model("specialisation", SpecialisationSchema);
mongoose.model("adminInfo", AdminDetailSchema);
