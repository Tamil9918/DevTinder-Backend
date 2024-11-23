require("dotenv").config();
const express = require("express");

const app = express();
const { adminAuth, userAuth } = require("./middlewares/auth");
app.use("/admin", adminAuth);
app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Something went wrong");
  }
});

app.listen(process.env.PORT, () => {
  console.log(
    `DevTinder Backend Server is listening at port:${process.env.PORT}`
  );
});
