// src/features/ticketSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_URL from "../api";

const getToken = () => localStorage.getItem("token");

// ------------------------------
// Add Ticket (Student only)
export const addTicket = createAsyncThunk(
  "tickets/addTicket",
  async (ticketData, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create ticket");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch My Tickets (Student)
export const fetchMyTickets = createAsyncThunk(
  "tickets/fetchMyTickets",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/tickets/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch tickets");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch All Tickets (Admin)
export const fetchAdminTickets = createAsyncThunk(
  "tickets/fetchAdminTickets",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch tickets");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ------------------------------
// Assign Ticket to Department (Admin)
export const assignTicket = createAsyncThunk(
  "tickets/assignTicket",
  async ({ ticketId, departmentId }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ departmentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign ticket");
      return data.ticket;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ------------------------------
// Slice
const ticketSlice = createSlice({
  name: "tickets",
  initialState: {
    tickets: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTicketError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Ticket
      .addCase(addTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.push(action.payload.ticket || action.payload);
      })
      .addCase(addTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error creating ticket";
      })

      // Fetch My Tickets
      .addCase(fetchMyTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets || [];
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching tickets";
      })

      // Fetch Admin Tickets
      .addCase(fetchAdminTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets || [];
      })
      .addCase(fetchAdminTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching tickets";
      })

      // Assign Ticket
      .addCase(assignTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTicket.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) state.tickets[index] = action.payload;
      })
      .addCase(assignTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error assigning ticket";
      });
  },
});

export const { clearTicketError } = ticketSlice.actions;
export default ticketSlice.reducer;
