import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
// Initial state for user slice
const initialState = {
  user: null,
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
      // Fetch user
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
      });
  },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;
