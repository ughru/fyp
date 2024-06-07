const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema(
{
    firstName: String,
    lastName: String,
    status: String,
    email: { type: String, unique: true },
    password: String,
},
{
    collection: "UserInfo"
});


mongoose.model("userInfo", UserDetailSchema);

const SpecialistDetailSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        uen: String,
        email: { type: String, unique: true },
        password: String,
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
    },
    {
        collection: "AdminInfo"
    });
    
    
mongoose.model("adminInfo", AdminDetailSchema);