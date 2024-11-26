require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  console.log("Admin auth is getting checked!");
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  if (!isAdminAuthorized) {
    res.status(401).send("Unauthorized request");
  } else {
    next();
  }
};

const userAuth = async (req, res, next) => {
  try {
    //Read the token from req
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid Token");
    }
    const decodedData = await jwt.verify(token, process.env.TOKEN_SECRET);
    //validate the token

    const { _id } = decodedData;

    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User Not Found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Error:" + error.message);
  }
};

module.exports = { adminAuth, userAuth };
