const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName"]);

    res.json({ message: "Data fetched successfully", data: connectionRequest });
  } catch (error) {
    res.status(400).send("Error:" + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequestModel.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName"])
      .populate("toUserId", ["firstName", "lastName"]);
    const data = connectionRequest.map((r) => {
      if (r.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return r.toUserId;
      }
      return r.fromUserId;
    });
    res.json({ message: "Data fetched successfully", data });
  } catch (error) {
    res.status(400).send("Error:" + error.message);
  }
});
module.exports = userRouter;
