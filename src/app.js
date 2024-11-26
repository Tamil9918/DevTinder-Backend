require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const { userAuth } = require("./middlewares/auth");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.post("/signup", async (req, res) => {
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

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(400).send("Error saving record to db" + error.message);
  }
});

app.get("/user", async (req, res) => {
  try {
    const users = await User.findOne({ emailId: req.body.email });
    if (!users) {
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (error) {
    res.status(400).send("Error saving record to db" + error.message);
  }
});

app.delete("/user", async (req, res) => {
  try {
    const userId = await User.findByIdAndDelete({ _id: req.body.userId });
    if (!userId) {
      res.status(404).send("User not found");
    } else {
      res.send("User Deleted Successfully...");
    }
  } catch (error) {
    res.status(400).send("Error saving record to db" + error.message);
  }
});

app.patch("/user", async (req, res) => {
  try {
    const userId = await User.findOneAndUpdate(
      { _id: req.body.userId },
      req.body,
      { returnDocument: "after" }
    );
    if (!userId) {
      res.status(404).send("User not found");
    } else {
      res.send("User Updated Successfully...");
    }
  } catch (error) {
    res.status(400).send("Error saving record to db" + error.message);
  }
});

app.patch("/userById", async (req, res) => {
  try {
    const ALLOWED_UPDATES = [
      "userId",
      "secondName",
      "age",
      "gender",
      "skills",
      "age",
      "about",
      "photoUrl",
    ];

    const isUpdateAllowed = Object.keys(req.body).every((key) =>
      ALLOWED_UPDATES.includes(key)
    );
    if (!isUpdateAllowed) {
      throw new Error("Updates not allowed");
    }
    const user = await User.findByIdAndUpdate(
      { _id: req.body.userId },
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );
    res.send("User Updated Successfully");
  } catch (error) {
    res.status(400).send("Error updating record to db" + error.message);
  }
});

app.post("/login", async (req, res) => {
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
        res.cookie("token", token);
        res.send("Login Successful!");
      } else {
        throw new Error("Password is not correct!");
      }
    }
  } catch (error) {
    res.status(400).send("Error on login.Error Message:" + error.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res
      .status(400)
      .send("Error on fetching Profile.Error Message:" + error.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res
      .status(400)
      .send(
        "Error on sending connection request.Error Message:" + error.message
      );
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
