import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

const initialState = {
  teamMembers: [],
  inviteStatus: "idle",
  verifyStatus: "idle",
  fetchStatus: "idle",
  error: null,
};

// Async thunk to fetch team members for a given workspaceId
export const fetchTeamMembers = createAsyncThunk(
  "teamMembers/fetchTeamMembers",
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/workspaces/${workspaceId}/members`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for inviting a new team member
export const inviteTeamMember = createAsyncThunk(
  "teamMembers/inviteTeamMember",
  async ({ workspaceId, email, role }, { rejectWithValue }) => {
    try {
      const response = axiosInstance.post(
        `/workspaces/${workspaceId}/members/invite`,
        { email, role }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for verifying the invitation (setting password)
export const verifyTeamMember = createAsyncThunk(
  "teamMembers/verifyTeamMember",
  async ({ workspaceId, code, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/workspaces/${workspaceId}/members/verify`,
        { code, password }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create the teamMembers slice.
const teamMemberSlice = createSlice({
  name: "teamMembers",
  initialState,
  reducers: {
    resetInviteStatus: (state) => {
      state.inviteStatus = "idle";
      state.error = null;
    },
    resetVerifyStatus: (state) => {
      state.verifyStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch team members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.teamMembers = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
      })
      // Invite team member
      .addCase(inviteTeamMember.pending, (state) => {
        state.inviteStatus = "loading";
      })
      .addCase(inviteTeamMember.fulfilled, (state, action) => {
        state.inviteStatus = "succeeded";
      })
      .addCase(inviteTeamMember.rejected, (state, action) => {
        state.inviteStatus = "failed";
        state.error = action.payload;
      })
      // Verify team member invitation
      .addCase(verifyTeamMember.pending, (state) => {
        state.verifyStatus = "loading";
      })
      .addCase(verifyTeamMember.fulfilled, (state, action) => {
        state.verifyStatus = "succeeded";
      })
      .addCase(verifyTeamMember.rejected, (state, action) => {
        state.verifyStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetInviteStatus, resetVerifyStatus } = teamMemberSlice.actions;
export default teamMemberSlice.reducer;
