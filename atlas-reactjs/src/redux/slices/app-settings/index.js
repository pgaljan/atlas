import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

const initialState = {
  appSettings: null,
  status: "idle",
  saveStatus: "idle",
  deleteStatus: "idle",
  error: null,
};

// Fetch current app settings
export const fetchAppSettings = createAsyncThunk(
  "appSettings/fetchAppSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/app-settings");
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Save (create or update) app settings
export const saveAppSettings = createAsyncThunk(
  "appSettings/saveAppSettings",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/app-settings/save", data);
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Remove app settings by ID
export const removeAppSettings = createAsyncThunk(
  "appSettings/removeAppSettings",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/app-settings/remove/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create the slice
const appSettingsSlice = createSlice({
  name: "appSettings",
  initialState,
  reducers: {
    resetAppSettingsStatus: (state) => {
      state.status = "idle";
      state.saveStatus = "idle";
      state.deleteStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAppSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAppSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.appSettings = action.payload;
      })
      .addCase(fetchAppSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Save
      .addCase(saveAppSettings.pending, (state) => {
        state.saveStatus = "loading";
      })
      .addCase(saveAppSettings.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.appSettings = action.payload;
      })
      .addCase(saveAppSettings.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload;
      })

      // Delete
      .addCase(removeAppSettings.pending, (state) => {
        state.deleteStatus = "loading";
      })
      .addCase(removeAppSettings.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.appSettings = null;
      })
      .addCase(removeAppSettings.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetAppSettingsStatus } = appSettingsSlice.actions;
export default appSettingsSlice.reducer;
