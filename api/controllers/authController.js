const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = [];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const trimmedName = String(name).trim();
        const normalizedEmail = String(email).trim().toLowerCase();

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty"
            });
        }

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const existingUser = users.find(user => user.email === normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            id: users.length + 1,
            name: trimmedName,
            email: normalizedEmail,
            password: hashedPassword
        };

        users.push(newUser);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = users.find(u => u.email === normalizedEmail);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const secret = process.env.JWT_SECRET || "default_emergency_jwt_secret_dev";
        const expiresIn = process.env.JWT_EXPIRES_IN || "24h";

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email
            },
            secret,
            { expiresIn }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        return next(error);
    }
};

const getMe = (req, res) => {
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    return res.status(200).json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
};

module.exports = {
    register,
    login,
    getMe
};