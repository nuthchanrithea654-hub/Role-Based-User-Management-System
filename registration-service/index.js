const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("./DBconnect");
const User = require("./models/User");

dotenv.config();

const app = express();

app.use(express.json());

// Connect to MongoDB
connectDB();

// REGISTER USER API
app.post("/userregister", async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user",
            phone
        });

        // Save user to MongoDB
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Registration Service is running on PORT ${PORT}`);
});