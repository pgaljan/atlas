import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
import Cookies from "js-cookie";

// Initial state for restore slice
const initialState = {
  status: "idle",
  error: null,
  message: null,
};

export const restoreBackup = createAsyncThunk(
  "restore/restoreBackup",
  async ({ fileData, structureId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", fileData);
      formData.append("structureId", structureId);

      const userId = Cookies.get("atlas_userId");
      if (userId) {
        formData.append("userId", userId);
      } else {
        throw new Error("User not authenticated. No userId found in cookies.");
      }

      const response = await axiosInstance.post("/restore", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const restoreFullBackup = createAsyncThunk(
  "restore/restoreFullBackup",
  async (fileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", fileData);

      // Pass userId for full backup restore as well.
      const userId = Cookies.get("atlas_userId");
      if (userId) {
        formData.append("userId", userId);
      } else {
        throw new Error("User not authenticated. No userId found in cookies.");
      }

      const response = await axiosInstance.post("/restore/full", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Restore slice
const restoreSlice = createSlice({
  name: "restore",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // restoreBackup cases
      .addCase(restoreBackup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(restoreBackup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
      })
      .addCase(restoreBackup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // restoreFullBackup cases
      .addCase(restoreFullBackup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(restoreFullBackup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
      })
      .addCase(restoreFullBackup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default restoreSlice.reducer;
