const bcrypt = require("bcryptjs");

const {
  prisma
} = require("../config/database");

const {
  generateToken
} = require("../utils/token");


async function register(req, res) {

  try {

    const {
      name,
      email,
      password,
      studentId,
      phone
    } = req.body;


    if (!name || !email || !password) {

      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    if (password.length < 8) {

      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters"
      });

    }


    const domain =
      process.env.SRM_EMAIL_DOMAIN;


    if (
      domain &&
      !normalizedEmail.endsWith(`@${domain}`)
    ) {

      return res.status(400).json({
        success: false,
        message: "Please use your SRM email address"
      });

    }


    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail
        }
      });


    if (existingUser) {

      return res.status(409).json({
        success: false,
        message: "User already exists"
      });

    }


    const passwordHash =
      await bcrypt.hash(password, 12);


    const user =
      await prisma.user.create({

        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          studentId: studentId || null,
          phone: phone || null,
          role: "STUDENT"
        },

        select: {
          id: true,
          name: true,
          email: true,
          studentId: true,
          phone: true,
          role: true,
          createdAt: true
        }

      });


    const token =
      generateToken(user);


    return res.status(201).json({

      success: true,

      message: "Registration successful",

      data: {
        user,
        token
      }

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Registration failed"
    });

  }

}


async function login(req, res) {

  try {

    const {
      email,
      password
    } = req.body;


    if (!email || !password) {

      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const user =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail
        }
      });


    if (!user) {

      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });

    }


    const passwordValid =
      await bcrypt.compare(
        password,
        user.passwordHash
      );


    if (!passwordValid) {

      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });

    }


    if (!user.isActive) {

      return res.status(403).json({
        success: false,
        message: "Account is disabled"
      });

    }


    const token =
      generateToken(user);


    return res.json({

      success: true,

      message: "Login successful",

      data: {

        token,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          phone: user.phone,
          role: user.role
        }

      }

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failed"
    });

  }

}


async function getProfile(req, res) {

  try {

    const user =
      await prisma.user.findUnique({

        where: {
          id: req.user.userId
        },

        select: {
          id: true,
          name: true,
          email: true,
          studentId: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true
        }

      });


    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }


    return res.json({
      success: true,
      data: user
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });

  }

}


module.exports = {
  register,
  login,
  getProfile
};