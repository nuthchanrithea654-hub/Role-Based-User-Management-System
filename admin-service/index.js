const express = require("express");
const dotenv = require("dotenv");

const connectDB = require("./DBconnect");
const User = require("./models/User");

dotenv.config();

const app = express();

app.use(express.json());

// Connect to MongoDB
connectDB();


// ==========================================
// SEARCH USER BY NAME OR EMAIL
// ==========================================
app.get("/admin/searchuser", async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({
                message: "Please provide a name or email to search"
            });
        }

        const users = await User.find({
            $or: [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ]
        }).select("-password");

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User found",
            users: users
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// VIEW ALL USERS
// ==========================================
app.get("/admin/viewalluser", async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            message: "All users retrieved successfully",
            totalUsers: users.length,
            users: users
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// DELETE USER BY EMAIL
// ==========================================
app.delete("/admin/deluser", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const deletedUser = await User.findOneAndDelete({
            email: email
        });

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User deleted successfully",
            user: {
                id: deletedUser._id,
                name: deletedUser.name,
                email: deletedUser.email,
                role: deletedUser.role
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// START ADMIN SERVICE
// ==========================================
const PORT = 5003;

app.listen(PORT, () => {
    console.log(`Admin Service is running on PORT ${PORT}`);
});