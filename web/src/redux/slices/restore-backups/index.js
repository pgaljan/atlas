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
        headers: { "Content-Type": "multipart/form-data" },
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

      const userId = Cookies.get("atlas_userId");
      if (userId) {
        formData.append("userId", userId);
      } else {
        throw new Error("User not authenticated. No userId found in cookies.");
      }

      const response = await axiosInstance.post("/restore/full", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ← CORRECTED: no extra () here!
export const restoreFullFromUrl = createAsyncThunk(
  "restore/restoreFullFromUrl",
  async (url, { rejectWithValue }) => {
    try {
      const userId = Cookies.get("atlas_userId");
      const workspaceId = Cookies.get("workspaceId");
      if (!userId) {
        throw new Error("User not authenticated. No userId found in cookies.");
      }

      const response = await axiosInstance.post(
        "/restore/full-from-url",
        { url, userId, workspaceId },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const restoreSlice = createSlice({
  name: "restore",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // restoreBackup
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
      // restoreFullBackup
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
      })
      // restoreFullFromUrl
      .addCase(restoreFullFromUrl.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(restoreFullFromUrl.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
      })
      .addCase(restoreFullFromUrl.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default restoreSlice.reducer;
