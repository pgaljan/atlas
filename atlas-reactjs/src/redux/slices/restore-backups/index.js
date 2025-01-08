import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
// Initial state for restore slice
const initialState = {
  status: "idle",
  error: null,
  message: null,
};

// Async thunk for restoring a backup
export const restoreBackup = createAsyncThunk(
  "restore/restoreBackup",
  async (fileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", fileData);
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

// Restore slice
const restoreSlice = createSlice({
  name: "restore",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Restore backup
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
      });
  },
});

export default restoreSlice.reducer;
