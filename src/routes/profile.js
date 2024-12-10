const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfile } = require("../utils/validation");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res
      .status(400)
      .send("Error on fetching Profile.Error Message:" + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("Invalid Edit fields");
    }
    const loggedUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedUser[key] = req.body[key]));
    await loggedUser.save();
    res.json({
      message: `${loggedUser.firstName} , your profile updated successfully`,
      data: loggedUser,
    });
  } catch (error) {
    res
      .status(400)
      .send("Error on fetching Profile.Error Message:" + error.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const isPasswordValid = await loggedUser.validatePassword(
      req.body.password
    );
    if (isPasswordValid) {
      throw new Error("Old Password and new Password are same!");
    } else {
      //create a JWT Token
      const updatePasswordHash = await loggedUser.encryptPassword(
        req.body.password
      );
      loggedUser.password = updatePasswordHash;
      await loggedUser.save();
      //Add token to cookie and send response back to client
      res
        .cookie("token", updatePasswordHash)
        .send(`${loggedUser.firstName} , your password updated successfully`);
    }
  } catch (error) {
    res
      .status(400)
      .send("Error on fetching Profile.Error Message:" + error.message);
  }
});
module.exports = profileRouter;
