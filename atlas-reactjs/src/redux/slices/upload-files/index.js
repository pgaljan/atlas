import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
// Initial state for file upload slice
const initialState = {
  uploadedFile: null,
  parsedData: null,
  files: [],
  status: "idle",
  error: null,
};

// Async thunk for uploading and parsing files
export const uploadFile = createAsyncThunk(
  "file/upload",
  async ({ file, userId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await axiosInstance.post("/file/upload", formData, {
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

// Async thunk for fetching all files
export const fetchAllFiles = createAsyncThunk(
  "file/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/file");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting a file
export const deleteFile = createAsyncThunk(
  "file/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/file/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// File upload slice
const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    clearUploadedFile: (state) => {
      state.uploadedFile = null;
      state.parsedData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.uploadedFile = action.payload;
        state.parsedData = action.payload.insertedRecords || null;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch all files
      .addCase(fetchAllFiles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllFiles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.files = action.payload;
      })
      .addCase(fetchAllFiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete file
      .addCase(deleteFile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.files = state.files.filter((file) => file.id !== action.payload);
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearUploadedFile } = fileSlice.actions;
export default fileSlice.reducer;
