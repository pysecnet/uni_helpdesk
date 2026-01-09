import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    category: {
      type: String,
      required: true,
      enum: ["Technical Issue", "Academic Query", "Administrative Help"],
    },

    description: { type: String, required: true, trim: true },

    // Auto-increment ticket number (auto-generated)
    ticketNo: { type: Number, unique: true },

    // Student info
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Enter valid email",
      ],
    },
    studentPhone: {
      type: String,
      required: true,
      match: [/^0\d{3}-\d{7}$/, "Enter valid phone number (e.g. 0316-3280715)"],
    },

    // Linked user who created the ticket
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ticket status
    status: {
      type: String,
      enum: ["Open", "Assigned", "In Progress", "Closed"], // ✅ Added "Assigned"
      default: "Open",
    },

    // Assigned Department
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // Who handled it (optional)
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ✅ Auto-increment ticket number before saving
ticketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketNo) {
    try {
      const lastTicket = await this.constructor
        .findOne()
        .sort({ ticketNo: -1 });
      this.ticketNo = lastTicket ? lastTicket.ticketNo + 1 : 1001; // start from 1001
    } catch (err) {
      console.error("Error generating ticket number:", err);
    }
  }
  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
