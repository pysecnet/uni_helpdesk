import Ticket from "../models/ticketModel.js";
import User from "../models/userModel.js";
import Department from "../models/departmentModel.js";

// Helper function to extract department from roll number
const getDepartmentFromRollNumber = (rollNumber) => {
  const match = rollNumber.match(/2k\d{2}-(CS|IT|EE|ME|CE)-\d+/i);
  if (match) {
    return match[1].toUpperCase();
  }
  return null;
};

// Helper function to get year from roll number
const getYearFromRollNumber = (rollNumber) => {
  const match = rollNumber.match(/2k(\d{2})/i);
  if (match) {
    return `20${match[1]}`;
  }
  return null;
};

// ------------------------------
// Create Ticket (Student only)
// ------------------------------
export const createTicket = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Student access only" });
    }

    // Get student details
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify student has roll number
    if (!student.rollNumber) {
      return res.status(400).json({ 
        message: "Roll number is required. Please update your profile." 
      });
    }

    const { title, category, description, studentEmail, studentPhone } = req.body;

    if (!title || !category || !description || !studentEmail || !studentPhone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Extract department from roll number
    const deptCode = getDepartmentFromRollNumber(student.rollNumber);
    const year = getYearFromRollNumber(student.rollNumber);

    console.log(`📋 Student: ${student.fullname}, Roll: ${student.rollNumber}, Dept: ${deptCode}, Year: ${year}`);

    const newTicket = await Ticket.create({
      title,
      category,
      description,
      studentEmail,
      studentPhone,
      studentRollNumber: student.rollNumber,
      studentDepartment: deptCode,
      studentYear: year,
      createdBy: req.user._id,
    });

    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate("createdBy", "fullname email rollNumber")
      .populate("assignedDepartment", "name");

    res.status(201).json({ 
      message: "Ticket created successfully", 
      ticket: populatedTicket 
    });
  } catch (error) {
    console.error("❌ Ticket creation error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------------------
// Get My Tickets (Student only)
// ------------------------------
export const getMyTickets = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Student access only" });
    }

    const tickets = await Ticket.find({ createdBy: req.user._id })
      .populate("assignedDepartment", "name")
      .populate("createdBy", "fullname email rollNumber")
      .sort({ createdAt: -1 });
    
    res.json({ tickets });
  } catch (error) {
    console.error("❌ Get My Tickets error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Get All Tickets (Admin only)
// ------------------------------
export const getAllTickets = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const tickets = await Ticket.find()
      .populate("createdBy", "fullname email rollNumber")
      .populate("assignedDepartment", "name")
      .sort({ createdAt: -1 });
    
    res.json({ tickets });
  } catch (error) {
    console.error("❌ Get All Tickets error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Assign Ticket to Department (Admin only)
// ------------------------------
export const assignTicketToDepartment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { ticketId } = req.params;
    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update ticket with department and change status to "Assigned"
    ticket.assignedDepartment = departmentId;
    ticket.status = "Assigned";
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticketId)
      .populate("assignedDepartment", "name")
      .populate("createdBy", "fullname email rollNumber");

    res.json({
      message: "Ticket assigned successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    console.error("❌ Assign Ticket error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Get Department Tickets (Department only)
// ------------------------------
export const getDepartmentTickets = async (req, res) => {
  try {
    if (req.user.role !== "department") {
      return res.status(403).json({ message: "Department access only" });
    }

    console.log("👤 User:", req.user);
    console.log("🏢 Department ID:", req.user.departmentId);

    // Filter tickets by the user's assigned department
    const tickets = await Ticket.find({
      assignedDepartment: req.user.departmentId,
    })
      .populate("createdBy", "fullname email rollNumber")
      .populate("assignedDepartment", "name")
      .sort({ createdAt: -1 });

    console.log("🎫 Found tickets:", tickets.length);

    res.json({ tickets });
  } catch (error) {
    console.error("❌ Get Department Tickets error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// Update Ticket Status (Admin or Department)
// ------------------------------
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    console.log("🔄 Update Status Request:", {
      ticketId,
      status,
      userRole: req.user.role,
      userDepartmentId: req.user.departmentId,
    });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Authorization Check
    if (req.user.role === "department") {
      if (!ticket.assignedDepartment) {
        return res.status(403).json({ 
          message: "This ticket is not assigned to any department yet" 
        });
      }

      if (ticket.assignedDepartment.toString() !== req.user.departmentId.toString()) {
        return res.status(403).json({
          message: "You are not authorized to update this ticket",
        });
      }

      // Department can only set "In Progress" or "Closed"
      if (!["In Progress", "Closed"].includes(status)) {
        return res.status(400).json({
          message: "Department can only set status to 'In Progress' or 'Closed'",
        });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update status
    ticket.status = status;
    if (status === "Closed") ticket.resolvedAt = new Date();
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticketId)
      .populate("assignedDepartment", "name")
      .populate("createdBy", "fullname email rollNumber");

    res.json({ 
      message: "Status updated successfully", 
      ticket: populatedTicket 
    });
  } catch (error) {
    console.error("❌ Update Ticket Status error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
