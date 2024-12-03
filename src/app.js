require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user.js");
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/", [authRouter, profileRouter, requestRouter, userRouter]);

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
