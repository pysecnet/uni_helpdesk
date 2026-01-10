// controllers/ticketController.js
import Ticket from "../models/ticketModel.js";
import Department from "../models/departmentModel.js";
import User from "../models/userModel.js";
import { validateRollNumber, extractDepartmentCode } from "../utils/rollNumberUtils.js";

// Create a new ticket with auto-department assignment
export const createTicket = async (req, res) => {
  try {
    const { title, category, description, studentEmail, studentPhone } = req.body;
    const userId = req.user._id;

    // Get user details to extract roll number
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate that user is a student
    if (user.role !== "student") {
      return res.status(403).json({
        message: "Only students can create support tickets",
      });
    }

    // Check if user has a roll number
    if (!user.rollNumber) {
      return res.status(400).json({
        message: "Your account does not have a roll number. Please contact administration.",
      });
    }

    // Validate roll number and check enrollment status
    const validation = validateRollNumber(user.rollNumber);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Cannot create ticket",
        error: validation.error,
        help: "Only currently enrolled students can create support tickets. If you believe this is an error, please contact the registrar's office.",
      });
    }

    // Extract department code from roll number
    const departmentCode = extractDepartmentCode(user.rollNumber);
    console.log(`Student roll number: ${user.rollNumber}, Department code: ${departmentCode}`);

    // Find the department by matching the code with department name
    // This assumes your departments are named like "Information Technology", "Computer Science", etc.
    const department = await Department.findOne({
      $or: [
        { name: { $regex: departmentCode, $options: "i" } },
        { name: validation.data.departmentName },
        { code: departmentCode }, // If you have a code field
      ],
    });

    if (!department) {
      return res.status(404).json({
        message: `Department not found for ${departmentCode}`,
        help: `No department matches your roll number (${user.rollNumber}). Available department codes: IT, CS, SE, EE, ME, CE, etc. Please contact IT support if your department is not listed.`,
      });
    }

    console.log(`Ticket auto-assigned to department: ${department.name} (${department._id})`);

    // Generate ticket number
    const ticketCount = await Ticket.countDocuments();
    const ticketNo = `TKT-${Date.now()}-${ticketCount + 1}`;

    // Create the ticket with auto-assigned department
    const ticket = await Ticket.create({
      userId,
      title,
      category,
      description,
      studentEmail: studentEmail || user.email,
      studentPhone: studentPhone || user.phone,
      ticketNo,
      assignedDepartment: department._id,
      status: "Assigned", // Automatically assigned to department
      studentRollNumber: user.rollNumber,
      studentYear: validation.data.studentYear,
      enrollmentYear: validation.data.enrollmentYear,
    });

    // Populate department info in response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("assignedDepartment", "name")
      .populate("userId", "fullname email rollNumber");

    res.status(201).json({
      message: "Ticket created and assigned successfully",
      ticket: populatedTicket,
      assignedTo: department.name,
      studentInfo: {
        rollNumber: user.rollNumber,
        year: validation.data.studentYear,
        department: validation.data.departmentName,
      },
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      message: "Error creating ticket",
      error: error.message,
    });
  }
};

// Get tickets for student (their own tickets)
export const getMyTickets = async (req, res) => {
  try {
    const userId = req.user._id;

    const tickets = await Ticket.find({ userId })
      .populate("assignedDepartment", "name")
      .sort({ createdAt: -1 });

    res.json({
      tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      message: "Error fetching tickets",
      error: error.message,
    });
  }
};

// Get all tickets (admin only)
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("assignedDepartment", "name")
      .populate("userId", "fullname email rollNumber")
      .sort({ createdAt: -1 });

    res.json({
      tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      message: "Error fetching tickets",
      error: error.message,
    });
  }
};

// Get tickets for a specific department (department admin)
export const getDepartmentTickets = async (req, res) => {
  try {
    const user = req.user;

    // If user is main admin, return all tickets
    if (user.role === "admin") {
      const tickets = await Ticket.find()
        .populate("assignedDepartment", "name")
        .populate("userId", "fullname email rollNumber")
        .sort({ createdAt: -1 });

      return res.json({
        tickets,
        count: tickets.length,
      });
    }

    // If user is department admin, return only their department's tickets
    if (user.role === "department") {
      if (!user.departmentId) {
        return res.status(400).json({
          message: "Your account is not assigned to a department",
        });
      }

      const tickets = await Ticket.find({ assignedDepartment: user.departmentId })
        .populate("assignedDepartment", "name")
        .populate("userId", "fullname email rollNumber")
        .sort({ createdAt: -1 });

      return res.json({
        tickets,
        count: tickets.length,
        department: user.departmentId,
      });
    }

    res.status(403).json({
      message: "Unauthorized access",
    });
  } catch (error) {
    console.error("Error fetching department tickets:", error);
    res.status(500).json({
      message: "Error fetching department tickets",
      error: error.message,
    });
  }
};

// Assign ticket to department (admin only)
export const assignTicketToDepartment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { departmentId } = req.body;

    // Only main admin can manually reassign tickets
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only main admin can reassign tickets",
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    ticket.assignedDepartment = departmentId;
    ticket.status = "Assigned";
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId)
      .populate("assignedDepartment", "name")
      .populate("userId", "fullname email rollNumber");

    res.json({
      message: "Ticket reassigned successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    res.status(500).json({
      message: "Error assigning ticket",
      error: error.message,
    });
  }
};

// Update ticket status (department admin or main admin)
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const user = req.user;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check permissions
    if (user.role === "department") {
      // Department admin can only update tickets assigned to their department
      if (ticket.assignedDepartment.toString() !== user.departmentId.toString()) {
        return res.status(403).json({
          message: "You can only update tickets assigned to your department",
        });
      }
    } else if (user.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized to update ticket status",
      });
    }

    // Validate status
    const validStatuses = ["Open", "Assigned", "In Progress", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        validStatuses,
      });
    }

    ticket.status = status;
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId)
      .populate("assignedDepartment", "name")
      .populate("userId", "fullname email rollNumber");

    res.json({
      message: "Ticket status updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({
      message: "Error updating ticket status",
      error: error.message,
    });
  }
};

// Get ticket statistics (for admin dashboard)
export const getTicketStats = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    // If department admin, filter by their department
    if (user.role === "department" && user.departmentId) {
      query.assignedDepartment = user.departmentId;
    }

    const totalTickets = await Ticket.countDocuments(query);
    const openTickets = await Ticket.countDocuments({ ...query, status: "Open" });
    const assignedTickets = await Ticket.countDocuments({ ...query, status: "Assigned" });
    const inProgressTickets = await Ticket.countDocuments({ ...query, status: "In Progress" });
    const closedTickets = await Ticket.countDocuments({ ...query, status: "Closed" });

    // Get tickets by department
    const ticketsByDepartment = await Ticket.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$assignedDepartment",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: "$department",
      },
      {
        $project: {
          departmentName: "$department.name",
          count: 1,
        },
      },
    ]);

    res.json({
      stats: {
        total: totalTickets,
        open: openTickets,
        assigned: assignedTickets,
        inProgress: inProgressTickets,
        closed: closedTickets,
      },
      byDepartment: ticketsByDepartment,
    });
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    res.status(500).json({
      message: "Error fetching ticket statistics",
      error: error.message,
    });
  }
};

export default {
  createTicket,
  getMyTickets,
  getAllTickets,
  getDepartmentTickets,
  assignTicketToDepartment,
  updateTicketStatus,
  getTicketStats,
};
