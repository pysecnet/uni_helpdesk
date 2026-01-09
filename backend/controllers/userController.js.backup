import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// =====================
// Register User
// =====================
export const registerUser = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const {
      fullname,
      email,
      password,
      gender = "Other",
      dob,
      address = "",
      role = "student", // ✅ Default to student
      departmentId = null, // ✅ Accept departmentId instead of departmentName
    } = req.body;

    // Check required fields
    if (!fullname || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // If role is department, departmentId is required
    if (role === "department" && !departmentId) {
      return res
        .status(400)
        .json({ message: "Department is required for role 'department'" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      gender,
      dob: dob ? new Date(dob) : undefined,
      address,
      role,
      departmentId, // ✅ Store departmentId reference
    });

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId || null,
      },
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =====================
// Login User
// =====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please provide email and password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId || null,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =====================
// Get User Profile
// =====================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =====================
// Get All Departments (Admin only)
// =====================
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await User.find({ role: "department" }).select(
      "fullname email departmentId"
    );
    if (!departments.length)
      return res.status(404).json({ message: "No departments found" });

    res.status(200).json({ departments });
  } catch (error) {
    console.error("Get Departments Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
