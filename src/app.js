require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();

app.post("/signup", async (req, res) => {
  const userObj = {
    firstName: "Tamil",
    lastName: "Selvan",
    emailId: "tamil@gmail.com",
    password: "test123",
  }; //creating a new instance of user model
  const user = new User(userObj);
  try {
    await user.save();
    res.send("User added successfully...");
  } catch (error) {
    res.status(400).send("Error saving record to db", error.message);
  }
});
connectDB()
  .then(() => {
    console.log("Database cluster connection established...");
  })
  .catch((err) => console.log("Error in connecting database cluster...", err));

app.listen(process.env.PORT, () => {
  console.log(
    `DevTinder Backend Server is listening at port:${process.env.PORT}`
  );
});
