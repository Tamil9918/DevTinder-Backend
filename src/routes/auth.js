const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const validator = require("validator");
const { validateSignUpData } = require("../utils/validation");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;
    //data validation
    validateSignUpData(req);
    //Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);
    //create new instance of user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User added successfully...");
  } catch (error) {
    res
      .status(400)
      .send("Error saving record to db.Error Message:" + error.message);
  }
});
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid Email Id" + emailId);
    } else {
      const user = await User.findOne({ emailId: emailId });
      if (!user) {
        throw new Error("Invalid Credentials");
      }
      const isPasswordValid = await user.validatePassword(password);
      if (isPasswordValid) {
        //create a JWT Token
        const token = await user.getJWT();
        //Add token to cookie and send response back to client
        res.cookie("token", token).send("Login Successful!");
      } else {
        throw new Error("Password is not correct!");
      }
    }
  } catch (error) {
    res.status(400).send("Error on login.Error Message:" + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .send("Logged out successfully!");
  } catch (error) {
    res.status(400).send("Error on logout.Error Message:" + error.message);
  }
});
module.exports = authRouter;
