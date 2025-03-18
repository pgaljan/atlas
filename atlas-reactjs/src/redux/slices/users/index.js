import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

const initialState = {
  user: null,
  users: [],
  exportedFile: null,
  status: "idle",
  error: null,
};

// Async thunk for fetching user by ID
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching all users
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user/all");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating user details
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/user/update/${userId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting user
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/user/delete/${userId}`, {
        data: { reason },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ userId, oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/user/change-password/${userId}`,
        {
          oldPassword,
          newPassword,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for exporting users as an Excel sheet
export const exportUsers = createAsyncThunk(
  "user/exportUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user/export", {
        responseType: "arraybuffer",
      });
      return response.data;
    } catch (error) {
      let errorPayload;
      if (error.response?.data instanceof ArrayBuffer) {
        errorPayload = new TextDecoder("utf-8").decode(error.response.data);
      } else {
        errorPayload = error.response?.data || error.message;
      }
      return rejectWithValue(errorPayload);
    }
  }
);

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user by ID
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.user = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Export users
      .addCase(exportUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(exportUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.exportedFile = action.payload;
      })
      .addCase(exportUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;
