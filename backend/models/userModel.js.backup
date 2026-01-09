import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
      set: (value) => {
        if (!value) return "Other";
        const formatted = value.toLowerCase();
        if (formatted === "male") return "Male";
        if (formatted === "female") return "Female";
        return "Other";
      },
    },
    dob: { type: Date },
    address: { type: String, trim: true },
    role: {
      type: String,
      enum: ["student", "admin", "department"],
      default: "student",
    },
    // Link department users to Department collection
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
