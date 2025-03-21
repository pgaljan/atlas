import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

// Initial state
const initialState = {
  files: [],
  uploadedFile: null,
  parsedData: null,
  fileUrl: null,
  structureId: null,
  fileType: null,
  status: "idle",
  error: null,
};

// Async thunk for uploading and parsing files
export const uploadFile = createAsyncThunk(
  "file/upload",
  async ({ file, userId, structureId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      if (structureId) {
        formData.append("structureId", structureId);
      }

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

// Async thunk for fetching media by userId
export const fetchMediaByUserId = createAsyncThunk(
  "file/fetchByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/file/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating media
export const updateMedia = createAsyncThunk(
  "file/update",
  async ({ id, newFileUrl }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/file/${id}`, { newFileUrl });
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
      state.structureId = null;
      state.fileUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload.structureId) {
          state.structureId = action.payload.structureId;
        }
        if (action.payload.fileUrl) {
          state.fileUrl = action.payload.fileUrl;
        }
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch media by userId
      .addCase(fetchMediaByUserId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMediaByUserId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.files = action.payload;
      })
      .addCase(fetchMediaByUserId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update media
      .addCase(updateMedia.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateMedia.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedFile = action.payload;
        state.files = state.files.map((file) =>
          file.id === updatedFile.id ? updatedFile : file
        );
      })
      .addCase(updateMedia.rejected, (state, action) => {
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
