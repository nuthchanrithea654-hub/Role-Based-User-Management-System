const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connectDB = require("./DBconnect");
const User = require("./models/User");

dotenv.config();

const app = express();

app.use(express.json());

// Connect to MongoDB
connectDB();

// LOGIN API
app.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check required fields
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Email, password and role are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email, password or role"
            });
        }

        // Compare entered password with hashed password
        const matchedPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!matchedPassword) {
            return res.status(401).json({
                message: "Invalid email, password or role"
            });
        }

        // Check role
        if (user.role !== role) {
            return res.status(401).json({
                message: "Invalid email, password or role"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

const PORT = 5002;

app.listen(PORT, () => {
    console.log(`Login Service is running on PORT ${PORT}`);
});