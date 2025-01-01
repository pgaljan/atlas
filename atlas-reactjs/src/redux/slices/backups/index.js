import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

// Initial state for backup slice
const initialState = {
  backups: [],
  status: "idle",
  error: null,
};

// Async thunk to create a backup
export const createBackup = createAsyncThunk(
  "backup/create",
  async ({ userId, structureId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/backup/create", null, {
        params: { userId, structureId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to fetch a single backup
export const getBackup = createAsyncThunk(
  "backup/get",
  async (backupId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/backup/${backupId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to delete a backup
export const deleteBackup = createAsyncThunk(
  "backup/delete",
  async (backupId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/backup/delete/${backupId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to fetch all backups
export const getAllBackups = createAsyncThunk(
  "backup/getAll",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/backup", {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Backup slice
const backupSlice = createSlice({
  name: "backup",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create backup
      .addCase(createBackup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createBackup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.backups.push(action.payload);
      })
      .addCase(createBackup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch a single backup
      .addCase(getBackup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getBackup.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.backups.findIndex(
          (backup) => backup.id === action.payload.id
        );
        if (index === -1) {
          state.backups.push(action.payload);
        } else {
          state.backups[index] = action.payload;
        }
      })
      .addCase(getBackup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete backup
      .addCase(deleteBackup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteBackup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.backups = state.backups.filter(
          (backup) => backup.id !== action.meta.arg
        );
      })
      .addCase(deleteBackup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch all backups
      .addCase(getAllBackups.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllBackups.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.backups = action.payload;
      })
      .addCase(getAllBackups.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetError } = backupSlice.actions;
export default backupSlice.reducer;
