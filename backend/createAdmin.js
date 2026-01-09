// backend/createAdmin.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@unidesk.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const admin = await User.create({
      fullname: "Admin User",
      email: "admin@unidesk.com",
      password: hashedPassword,
      gender: "Other",
      address: "Admin Office",
      role: "admin",
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@unidesk.com");
    console.log("🔑 Password: admin123");
    console.log("\n⚠️ IMPORTANT: Change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdminUser();

