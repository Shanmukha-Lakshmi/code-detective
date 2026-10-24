const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    testAuth,
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

router.get("/me", protect, (req, res) => {
    res.json({
        message: "You are authenticated!",
        user: req.user
    });
});

router.get("/test", testAuth);

router.post("/register", registerUser);

router.post("/login", loginUser);

module.exports = router;