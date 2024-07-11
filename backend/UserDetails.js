const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema(
{
    firstName: {type: String},
    lastName: {type: String},
    status: {type: String},
    email: { type: String, unique: true },
    password: {type: String},
    state: {type: String},
},
{
    collection: "UserInfo"
});

mongoose.model("userInfo", UserDetailSchema);

const SpecialistDetailSchema = new mongoose.Schema(
{
    firstName: {type: String},
    lastName: {type: String},
    uen: {type: String},
    specialisation: {type: String},
    email: { type: String, unique: true },
    password: {type: String},
    state: {type: String},
},
{
    collection: "SpecialistInfo"
});
    
    
mongoose.model("specialistInfo", SpecialistDetailSchema);

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
    
    
mongoose.model("adminInfo", AdminDetailSchema);
