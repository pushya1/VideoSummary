const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const googleCallback = async (req, res) => {
  console.log("del",req.user);
  try {
    let user = await User.findOne({ googleId: req.user.id });

    if (!user) {
      user = await User.create({
        googleId: req.user.id,
        displayName: req.user.displayName,
        email: req.user.emails[0].value,
        photo: req.user.photos[0].value,
      });
    }

    const token = generateToken(user);
    res.redirect(`http://localhost:3000/?token=${token}`);
  } catch (error) {
    console.error("Error in Google callback:", error);
    res.redirect("/error");
  }
};

const getUser = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { googleCallback, getUser };
