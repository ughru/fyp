const express = require("express");
const app=express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
app.use(express.json());


const mongoUrl = "mongodb+srv://ru:admin@cluster0.dawierb.mongodb.net/bloom?retryWrites=true&w=majority&appName=Cluster0";


mongoose.connect(mongoUrl).then(()=> {
    console.log("Database Connected.");
})
.catch((e)=>{
    console.log(e);
})
require('./UserDetails');
const User = mongoose.model("userInfo");


app.get("/", (req, res) => {
    res.send({status: "Started"})
});


app.post("/register", async(req, res)=> {
    const {firstName, lastName, type, email, password} = req.body;


    const oldUser = await User.findOne({email: email});


    if(oldUser) {
        return res.send({data: "User already exists!"});
    }


    try {
        // hashed password before storing
        const hashedPassword = await bcrypt.hash(password, 10);


        await User.create({
            firstName: firstName,
            lastName: lastName,
            type,
            email: email,
            password: hashedPassword,
        });
        res.send({status: "ok", data:"User Created"})
    } catch (error) {
        res.send({status: "error", data: error})
    }
});


app.post("/login", async (req, res) => {
    const { email, password } = req.body;
 
    try {
        const user = await User.findOne({ email });


        if (!user) {
        return res.send({ error: "User does not exist!" });
        }


        // check if password matches that in db
        const passwordMatch = await bcrypt.compare(password, user.password);


        if (!passwordMatch) {
            return res.send({ error: "Invalid password" });
        }


        res.send({ status: "ok" });
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
});


app.post("/logout", (req, res) => {
    // Perform logout actions (e.g., clear session, etc.)
    // Respond with success message or appropriate status code
    res.send({ message: "Logout successful" });
});


app.listen(5001, ()=> {
    console.log("Node js server started.");
});
