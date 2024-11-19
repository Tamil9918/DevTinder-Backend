require("dotenv").config();
const express = require("express");

const app = express();

app.use("/test", (req, res) => {
  res.send("Hello!");
});

app.listen(process.env.PORT, () => {
  console.log(
    `devTinder Backend Server is listening at port:${process.env.PORT}`
  );
});
