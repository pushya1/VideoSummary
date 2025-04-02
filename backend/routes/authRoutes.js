const express = require("express");
const passport = require("../config/passportConfig");
const { googleCallback, getUser } = require("../controllers/authController");
const authenticateJWT = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/" }), googleCallback);
router.get("/user", authenticateJWT, getUser);

module.exports = router;
