const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const testAuth = (req, res) => {
    res.json({
        message: "Auth controller is working!"
    });
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                xp: user.xp
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Username or email already exists."
            });
        }

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token",token,{
            httpOnly: true,
            secure: false,
            sameSite:"lax",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        res.json({
            message: "Login successful!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};
const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    res.json({
        message: "Logout successful!"
    });
};
module.exports = {
    testAuth,
    registerUser,
    loginUser,
    logoutUser
};