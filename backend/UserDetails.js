const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema(
{
    firstName: String,
    lastName: String,
    type: String,
    status: String,
    email: { type: String, unique: true },
    password: String,
},
{
    collection: "UserInfo"
});


mongoose.model("userInfo", UserDetailSchema);
