import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

// Initial state for administrator auth slice
const initialState = {
  administrator: null,
  token: null,
  allAdministrators: [],
  status: "idle",
  error: null,
};

// Async thunk for administrator registration
export const registerAdministrator = createAsyncThunk(
  "administrator/register",
  async (registerData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/administrator/register",
        registerData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for administrator login
export const loginAdministrator = createAsyncThunk(
  "administrator/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/administrator/login",
        credentials
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for administrator forgot password
export const forgotPasswordAdministrator = createAsyncThunk(
  "administrator/forgotPassword",
  async (forgotData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/administrator/forgot-password",
        forgotData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for administrator reset password
export const resetPasswordAdministrator = createAsyncThunk(
  "administrator/resetPassword",
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/administrator/reset-password",
        resetData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for administrator change password
export const changePasswordAdministrator = createAsyncThunk(
  "administrator/changePassword",
  async (changeData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        "/administrator/change-password",
        changeData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating administrator profile
export const updateAdministratorProfile = createAsyncThunk(
  "administrator/updateProfile",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/administrator/profile/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for getting administrator profile
export const getAdministratorProfile = createAsyncThunk(
  "administrator/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/administrator/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching all administrators
export const getAllAdministrators = createAsyncThunk(
  "administrator/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/administrator/all");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteAdministrator = createAsyncThunk(
  "administrator/delete",
  async (adminId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/administrator/${adminId}`);
      return adminId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Administrator auth slice
const administratorAuthSlice = createSlice({
  name: "administratorAuth",
  initialState,
  reducers: {
    logoutAdministrator: (state) => {
      state.administrator = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Administrator
      .addCase(registerAdministrator.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerAdministrator.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerAdministrator.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Login Administrator
      .addCase(loginAdministrator.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginAdministrator.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.administrator = action.payload.administrator;
        state.token = action.payload.access_token;
      })
      .addCase(loginAdministrator.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPasswordAdministrator.pending, (state) => {
        state.status = "loading";
      })
      .addCase(forgotPasswordAdministrator.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(forgotPasswordAdministrator.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPasswordAdministrator.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetPasswordAdministrator.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.access_token;
      })
      .addCase(resetPasswordAdministrator.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Change Password
      .addCase(changePasswordAdministrator.pending, (state) => {
        state.status = "loading";
      })
      .addCase(changePasswordAdministrator.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.administrator = action.payload.administrator;
      })
      .addCase(changePasswordAdministrator.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateAdministratorProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateAdministratorProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.administrator = action.payload.administrator;
      })
      .addCase(updateAdministratorProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getAdministratorProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAdministratorProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.administrator = action.payload;
      })
      .addCase(getAdministratorProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get All Administrators
      .addCase(getAllAdministrators.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllAdministrators.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allAdministrators = action.payload;
      })
      .addCase(getAllAdministrators.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      }) // Delete Administrator
      .addCase(deleteAdministrator.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteAdministrator.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allAdministrators = state.allAdministrators.filter(
          (admin) => admin.id !== action.payload
        );
      })
      .addCase(deleteAdministrator.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logoutAdministrator } = administratorAuthSlice.actions;
export default administratorAuthSlice.reducer;
