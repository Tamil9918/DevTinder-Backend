require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();
app.use(express.json());
app.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User added successfully...");
  } catch (error) {
    res.status(400).send("Error saving record to db" + error.message);
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
