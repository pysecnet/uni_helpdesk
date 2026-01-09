// src/pages/DepartmentDashboard.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartmentTickets,
  updateTicketStatus,
  clearDepartmentTicketState,
} from "../../features/departmentTicketSlice";

export default function DepartmentDashboard() {
  const dispatch = useDispatch();
  const { tickets, loading, error, successMessage } = useSelector(
    (state) => state.departmentTickets
  );

  // ✅ Local state for immediate UI updates
  const [localTickets, setLocalTickets] = useState([]);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);

  // Ensure tickets is always an array
  const ticketList = Array.isArray(tickets) ? tickets : tickets?.tickets || [];

  useEffect(() => {
    dispatch(fetchDepartmentTickets());
    return () => {
      dispatch(clearDepartmentTicketState());
    };
  }, [dispatch]);

  // ✅ Update local tickets when Redux tickets change
  useEffect(() => {
    setLocalTickets(ticketList);
  }, [ticketList]);

  const handleStatusChange = async (ticketId, newStatus) => {
    // Don't allow changing if already the same status
    const ticket = localTickets.find(t => t._id === ticketId);
    if (ticket?.status === newStatus) return;

    // ✅ Optimistic update - update UI immediately
    setUpdatingTicketId(ticketId);
    setLocalTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );

    // ✅ Update backend
    try {
      await dispatch(updateTicketStatus({ ticketId, status: newStatus })).unwrap();
      
      // ✅ Refresh the ticket list after successful update
      setTimeout(() => {
        dispatch(fetchDepartmentTickets());
      }, 500);
    } catch (err) {
      // ✅ Revert optimistic update on error
      setLocalTickets(ticketList);
      console.error("Failed to update status:", err);
      alert(`Failed to update status: ${err}`);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "badge bg-success";
      case "Assigned":
        return "badge bg-info";
      case "In Progress":
        return "badge bg-warning text-dark";
      case "Closed":
        return "badge bg-secondary";
      default:
        return "badge bg-light text-dark";
    }
  };

  const getStatusOptions = (currentStatus) => {
    // ✅ Define status transitions based on current status
    switch (currentStatus) {
      case "Assigned":
        return [
          { value: "Assigned", label: "Assigned (Current)" },
          { value: "In Progress", label: "In Progress" },
          { value: "Closed", label: "Closed" }
        ];
      case "In Progress":
        return [
          { value: "In Progress", label: "In Progress (Current)" },
          { value: "Closed", label: "Closed" }
        ];
      case "Closed":
        return [
          { value: "Closed", label: "Closed (Final)" }
        ];
      case "Open":
        return [
          { value: "Open", label: "Open (Current)" },
          { value: "In Progress", label: "In Progress" },
          { value: "Closed", label: "Closed" }
        ];
      default:
        return [
          { value: currentStatus, label: currentStatus }
        ];
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center fw-bold">🎫 Department Dashboard</h2>

      {loading && !updatingTicketId && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading tickets...</p>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}
      
      {successMessage && !updatingTicketId && (
        <div className="alert alert-success text-center" role="alert">
          ✅ {successMessage}
        </div>
      )}

      {localTickets.length === 0 && !loading ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
          <p className="text-muted mt-3">No tickets assigned to your department yet.</p>
        </div>
      ) : (
        <div className="row">
          {localTickets.map((ticket) => (
            <div key={ticket._id} className="col-md-6 col-lg-4 mb-4">
              <div className={`card shadow-sm h-100 ${updatingTicketId === ticket._id ? 'border-primary' : ''}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">{ticket.title}</h5>
                    <span className={getStatusBadge(ticket.status)}>
                      {ticket.status}
                      {updatingTicketId === ticket._id && (
                        <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                      )}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="badge bg-light text-dark">
                      <i className="bi bi-tag me-1"></i>
                      {ticket.category}
                    </span>
                  </div>

                  <p className="card-text text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                    {ticket.description}
                  </p>

                  <div className="border-top pt-3 mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-envelope me-2 text-muted"></i>
                      <small className="text-truncate">{ticket.studentEmail}</small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-telephone me-2 text-muted"></i>
                      <small>{ticket.studentPhone}</small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-ticket-perforated me-2 text-muted"></i>
                      <small>#{ticket.ticketNo}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-clock me-2 text-muted"></i>
                      <small>{new Date(ticket.createdAt).toLocaleString()}</small>
                    </div>
                  </div>

                  <div>
                    <label className="form-label fw-semibold small mb-2">
                      <i className="bi bi-arrow-repeat me-1"></i>
                      Update Status:
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(ticket._id, e.target.value)
                      }
                      disabled={updatingTicketId === ticket._id || ticket.status === "Closed"}
                    >
                      {getStatusOptions(ticket.status).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    {ticket.status === "Closed" && (
                      <small className="text-muted d-block mt-1">
                        <i className="bi bi-check-circle me-1"></i>
                        This ticket is closed
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
