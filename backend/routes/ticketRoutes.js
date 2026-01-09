import express from "express";
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  assignTicketToDepartment,
  updateTicketStatus,
  getDepartmentTickets,
} from "../controllers/ticketController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------------------
// Student Routes
// ------------------------------
// Create ticket (student only)
router.post("/", protect, createTicket);

// Get logged-in student's tickets
router.get("/my", protect, getMyTickets);

// ------------------------------
// Admin Routes
// ------------------------------
// Get all tickets (admin only)
router.get("/", protect, getAllTickets);

// Assign ticket to department
// ✅ Ensure the frontend calls PUT /api/tickets/:ticketId/assign
router.put("/:ticketId/assign", protect, assignTicketToDepartment);

// Update ticket status
router.put("/:ticketId/status", protect, updateTicketStatus);

// ------------------------------
// Department Routes
// ------------------------------
// Get tickets assigned to this department
router.get("/department", protect, getDepartmentTickets);

export default router;
