require("dotenv").config();
const express = require("express");

const app = express();

app.use(
  "/test",
  (req, res, next) => {
    next();
  },
  (req, res) => {
    res.send("hi");
  }
);

app.listen(process.env.PORT, () => {
  console.log(
    `DevTinder Backend Server is listening at port:${process.env.PORT}`
  );
});
