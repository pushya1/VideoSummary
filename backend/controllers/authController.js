const generateToken = require("../utils/generateToken");

const googleCallback = (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`http://localhost:3000/?token=${token}`);
};

const getUser = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { googleCallback, getUser };
