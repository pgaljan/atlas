import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
import Cookies from "js-cookie";

const initialState = {
  invitations: [],
  createStatus: "idle",
  listStatus: "idle",
  verifyStatus: "idle",
  error: null,
};

// Async thunk to create an invitation
export const createInvitation = createAsyncThunk(
  "invitations/createInvitation",
  async ({ workspaceId, email }, { rejectWithValue }) => {
    try {
      const userId = Cookies.get("atlas_userId");
      const response = await axiosInstance.post(
        `/workspaces/${workspaceId}/invitations`,
        { email, userId }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to list invitations for a given workspace
export const listInvitations = createAsyncThunk(
  "invitations/listInvitations",
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/workspaces/${workspaceId}/invitations`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to create an invitation link
export const createInvitationLink = createAsyncThunk(
  "invitations/createInvitationLink",
  async ({ workspaceId }, { rejectWithValue }) => {
    try {
      const userId = Cookies.get("atlas_userId");
      const response = await axiosInstance.post(
        `/workspaces/${workspaceId}/invitations/link`,
        { userId }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to verify an invitation
export const verifyInvitation = createAsyncThunk(
  "invitations/verifyInvitation",
  async ({ workspaceId, token, referralCode }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/workspaces/${workspaceId}/invitations/verify`,
        { token, referralCode }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to delete an invitation
export const deleteInvitation = createAsyncThunk(
  "invitations/deleteInvitation",
  async ({ workspaceId, invitationId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        `/workspaces/${workspaceId}/invitations/${invitationId}`
      );
      return invitationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create the invitation slice.
const invitationSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
      state.error = null;
    },
    resetListStatus: (state) => {
      state.listStatus = "idle";
      state.error = null;
    },
    resetVerifyStatus: (state) => {
      state.verifyStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create invitation
      .addCase(createInvitation.pending, (state) => {
        state.createStatus = "loading";
      })
      .addCase(createInvitation.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createInvitation.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      })

      // Create Invitation Link
      .addCase(createInvitationLink.pending, (state) => {
        state.createStatus = "loading";
      })
      .addCase(createInvitationLink.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createInvitationLink.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      })

      // List invitations
      .addCase(listInvitations.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(listInvitations.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.invitations = action.payload;
      })
      .addCase(listInvitations.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload;
      })

      // Verify invitation
      .addCase(verifyInvitation.pending, (state) => {
        state.verifyStatus = "loading";
      })
      .addCase(verifyInvitation.fulfilled, (state) => {
        state.verifyStatus = "succeeded";
      })
      .addCase(verifyInvitation.rejected, (state, action) => {
        state.verifyStatus = "failed";
        state.error = action.payload;
      })
      
      // Delete invitation
      .addCase(deleteInvitation.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(deleteInvitation.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.invitations = state.invitations.filter(
          (invitation) => invitation.id !== action.payload
        );
      })
      .addCase(deleteInvitation.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetCreateStatus, resetListStatus, resetVerifyStatus } =
  invitationSlice.actions;

export default invitationSlice.reducer;
