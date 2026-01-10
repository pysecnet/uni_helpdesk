import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyTickets,
  fetchAdminTickets,
  assignTicket,
} from "../../features/ticketSlice";
import { fetchDepartments } from "../../features/departmentSlice";
import styles from "./Ticket.module.css";

export default function Ticket({ isAdmin = false }) {
  const dispatch = useDispatch();
  const {
    tickets = [],
    loading,
    error,
  } = useSelector((state) => state.tickets);
  
  const { 
    departments = [], 
    loading: deptLoading,
    error: deptError 
  } = useSelector((state) => state.departments);

  const [expandedTicket, setExpandedTicket] = useState(null);
  const [assignedDept, setAssignedDept] = useState({});
  const [assigningTicket, setAssigningTicket] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAdminTickets());
      dispatch(fetchDepartments());
    } else {
      dispatch(fetchMyTickets());
    }
  }, [dispatch, isAdmin]);

  const toggleExpand = (ticketNo) => {
    setExpandedTicket((prev) => (prev === ticketNo ? null : ticketNo));
  };

  const handleAssign = async (ticketId, deptId) => {
    if (!deptId) {
      alert("Please select a department!");
      return;
    }
    setAssigningTicket(ticketId);
    setAssignedDept((prev) => ({ ...prev, [ticketId]: deptId }));
    
    try {
      await dispatch(assignTicket({ ticketId, departmentId: deptId })).unwrap();
    } catch (err) {
      console.error("Failed to assign ticket:", err);
    } finally {
      setAssigningTicket(null);
    }
  };

  const departmentsList = Array.isArray(departments) ? departments : [];

  // Loading State
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.errorState}>
        <i className="bi bi-exclamation-circle"></i>
        <p>Error loading tickets: {error}</p>
      </div>
    );
  }

  // Empty State
  if (!tickets || tickets.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className="bi bi-inbox"></i>
        <h3>No Tickets Found</h3>
        <p>{isAdmin ? "No tickets have been submitted yet." : "You haven't submitted any tickets yet."}</p>
      </div>
    );
  }

  return (
    <div className={styles.ticketContainer}>
      {/* Department Loading/Error Messages */}
      {isAdmin && deptLoading && (
        <div className={styles.infoAlert}>
          <i className="bi bi-info-circle"></i>
          <span>Loading departments...</span>
        </div>
      )}
      
      {isAdmin && deptError && (
        <div className={styles.warningAlert}>
          <i className="bi bi-exclamation-triangle"></i>
          <span>{deptError}</span>
        </div>
      )}

      {/* Tickets Grid */}
      <div className={styles.ticketsGrid}>
        {tickets.map((ticket) => (
          <div key={ticket._id} className={styles.ticketCard}>
            {/* Card Header */}
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <h4 className={styles.ticketTitle}>{ticket.title || "Untitled"}</h4>
                <div className={styles.ticketMeta}>
                  <span className={styles.ticketNumber}>
                    <i className="bi bi-hash"></i>
                    {ticket.ticketNo || "N/A"}
                  </span>
                  <span className={styles.categoryBadge}>
                    <i className="bi bi-tag"></i>
                    {ticket.category || "N/A"}
                  </span>
                </div>
              </div>
              <div className={styles.headerRight}>
                <span
                  className={`${styles.statusBadge} ${
                    styles[`status${ticket.status?.replace(/\s+/g, "") || "Unknown"}`]
                  }`}
                >
                  {ticket.status || "Unknown"}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className={styles.cardBody}>
              <div className={styles.description}>
                <p className={styles.descriptionText}>
                  {expandedTicket === ticket.ticketNo
                    ? ticket.description || "No description provided"
                    : `${ticket.description?.slice(0, 100) || "No description"}${
                        ticket.description?.length > 100 ? "..." : ""
                      }`}
                </p>
              </div>

              {/* Ticket Info */}
              <div className={styles.ticketInfo}>
                <div className={styles.infoItem}>
                  <i className="bi bi-calendar"></i>
                  <span>
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <i className="bi bi-clock"></i>
                  <span>
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTicket === ticket.ticketNo && (
                <div className={styles.expandedDetails}>
                  <div className={styles.detailsGrid}>
                    {ticket.studentEmail && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-envelope"></i>
                        <div>
                          <span className={styles.detailLabel}>Email</span>
                          <span className={styles.detailValue}>
                            {ticket.studentEmail}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {ticket.studentPhone && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-telephone"></i>
                        <div>
                          <span className={styles.detailLabel}>Phone</span>
                          <span className={styles.detailValue}>
                            {ticket.studentPhone}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {ticket.assignedDepartment && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-building"></i>
                        <div>
                          <span className={styles.detailLabel}>Department</span>
                          <span className={styles.detailValue}>
                            {ticket.assignedDepartment.name}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {ticket.updatedAt && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-clock-history"></i>
                        <div>
                          <span className={styles.detailLabel}>Last Updated</span>
                          <span className={styles.detailValue}>
                            {new Date(ticket.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Assignment Section */}
              {isAdmin && (
                <div className={styles.assignmentSection}>
                  <label className={styles.assignmentLabel}>
                    <i className="bi bi-building"></i>
                    Assign to Department
                  </label>
                  <div className={styles.assignmentControls}>
                    <select
                      className={styles.departmentSelect}
                      value={
                        assignedDept[ticket._id] ||
                        ticket.assignedDepartment?._id ||
                        ""
                      }
                      onChange={(e) =>
                        setAssignedDept((prev) => ({
                          ...prev,
                          [ticket._id]: e.target.value,
                        }))
                      }
                      disabled={
                        departmentsList.length === 0 ||
                        ticket.status === "Closed" ||
                        assigningTicket === ticket._id
                      }
                    >
                      <option value="">
                        {departmentsList.length === 0
                          ? "No departments available"
                          : "Select Department"}
                      </option>
                      {departmentsList.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.assignButton}
                      onClick={() =>
                        handleAssign(ticket._id, assignedDept[ticket._id])
                      }
                      disabled={
                        !assignedDept[ticket._id] ||
                        departmentsList.length === 0 ||
                        ticket.status === "Closed" ||
                        assigningTicket === ticket._id
                      }
                    >
                      {assigningTicket === ticket._id ? (
                        <>
                          <span className={styles.buttonSpinner}></span>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle"></i>
                          Assign
                        </>
                      )}
                    </button>
                  </div>
                  {departmentsList.length === 0 && (
                    <span className={styles.assignmentHint}>
                      <i className="bi bi-info-circle"></i>
                      Please add departments first
                    </span>
                  )}
                  {ticket.status === "Closed" && (
                    <span className={styles.assignmentHint}>
                      <i className="bi bi-lock"></i>
                      Cannot reassign closed tickets
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className={styles.cardFooter}>
              <button
                className={styles.detailsButton}
                onClick={() => toggleExpand(ticket.ticketNo)}
              >
                {expandedTicket === ticket.ticketNo ? (
                  <>
                    <i className="bi bi-chevron-up"></i>
                    <span>Hide Details</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-chevron-down"></i>
                    <span>View Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
