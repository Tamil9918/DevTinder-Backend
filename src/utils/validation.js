const validator = require("validator");
const { all } = require("../routes/auth");
module.exports = {
  validateSignUpData: (req) => {
    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName) {
      throw new Error("Name is not valid");
    } else if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid");
    } else if (!validator.isStrongPassword(password)) {
      throw new Error("Please enter a strong password");
    }
  },
  validateEditProfile: (req) => {
    const allowedEditFields = [
      "firstName",
      "lastName",
      "about",
      "photoUrl",
      "about",
      "gender",
      "skills",
      "emailId",
      "age",
    ];

    const isEditAllowed = Object.keys(req.body).every((field) =>
      allowedEditFields.includes(field)
    );
    return isEditAllowed;
  },
};
