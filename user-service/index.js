const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const connectDB = require("./DBconnect");
const User = require("./models/User");

dotenv.config();

const app = express();

app.use(express.json());

// Connect to MongoDB
connectDB();


// ==========================================
// GET USER PROFILE
// ==========================================
app.get("/user/viewprofile", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.decode(token);

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User profile retrieved successfully",
            user: user
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// UPDATE USER PROFILE
// ==========================================
app.put("/user/updateprofile", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.decode(token);

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        const { name, phone } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            {
                name: name,
                phone: phone
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// START USER SERVICE
// ==========================================
const PORT = 5004;

app.listen(PORT, () => {
    console.log(`User Service is running on PORT ${PORT}`);
});