const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());


// ==========================================
// JWT TOKEN VALIDATION
// ==========================================
const verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    // No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Save decoded user information
        req.user = decoded;

        next();

    } catch (error) {

        // Expired token
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired"
            });
        }

        // Invalid / tampered token
        return res.status(401).json({
            message: "Invalid or tampered token"
        });
    }
};


// ==========================================
// ROLE AUTHORIZATION
// ==========================================
const authorizeRole = (role) => {

    return (req, res, next) => {

        if (req.user.role !== role) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};


// ==========================================
// REGISTRATION ROUTE
// PUBLIC - NO TOKEN REQUIRED
// ==========================================
app.post("/register/userregister", async (req, res) => {

    try {

        const response = await axios.post(
            "http://localhost:5001/userregister",
            req.body
        );

        res.status(response.status).json(response.data);

    } catch (error) {

        res.status(error.response?.status || 500).json(
            error.response?.data || {
                message: "Registration Service Error"
            }
        );
    }
});


// ==========================================
// LOGIN ROUTE
// PUBLIC - NO TOKEN REQUIRED
// ==========================================
app.post("/auth/login", async (req, res) => {

    try {

        const response = await axios.post(
            "http://localhost:5002/login",
            req.body
        );

        res.status(response.status).json(response.data);

    } catch (error) {

        res.status(error.response?.status || 500).json(
            error.response?.data || {
                message: "Login Service Error"
            }
        );
    }
});


// ==========================================
// ADMIN SERVICE ROUTING
// ADMIN TOKEN REQUIRED
// ==========================================
app.use(
    "/admin",
    verifyToken,
    authorizeRole("admin"),
    async (req, res) => {

        try {

            const response = await axios({
                method: req.method,
                url: `http://172.31.17.221:5003${req.originalUrl}`,
                data: req.body,
                headers: {
                    Authorization: req.headers.authorization
                }
            });

            res.status(response.status).json(response.data);

        } catch (error) {

            res.status(error.response?.status || 500).json(
                error.response?.data || {
                    message: "Admin Service Error"
                }
            );
        }
    }
);


// ==========================================
// USER SERVICE ROUTING
// USER TOKEN REQUIRED
// ==========================================
app.use(
    "/user",
    verifyToken,
    authorizeRole("user"),
    async (req, res) => {

        try {

            const response = await axios({
                method: req.method,
                url: `http://172.31.21.20:5004${req.originalUrl}`,
                data: req.body,
                headers: {
                    Authorization: req.headers.authorization
                }
            });

            res.status(response.status).json(response.data);

        } catch (error) {

            res.status(error.response?.status || 500).json(
                error.response?.data || {
                    message: "User Service Error"
                }
            );
        }
    }
);


// ==========================================
// START API GATEWAY
// ==========================================
const PORT = 5005;

app.listen(PORT, () => {
    console.log(`API Gateway is running on PORT ${PORT}`);
});