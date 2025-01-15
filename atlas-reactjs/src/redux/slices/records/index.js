import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

// Initial state for record slice
const initialState = {
  records: [],
  record: null,
  status: "idle",
  error: null,
};

// Async thunk for creating a record
export const createRecord = createAsyncThunk(
  "records/create",
  async ({ elementId, createRecordDto }, { rejectWithValue }) => {
    try {
      console.log(createRecordDto);
      const response = await axiosInstance.post(
        `/records/create?elementId=${elementId}`,
        createRecordDto
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching a single record
export const getRecordById = createAsyncThunk(
  "records/getById",
  async (recordId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/records/record/${recordId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching records by element ID
export const getRecordsByElement = createAsyncThunk(
  "records/getByElement",
  async (elementId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/records/element/${elementId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating a record
export const updateRecord = createAsyncThunk(
  "records/update",
  async ({ recordId, updateRecordDto }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/records/update/${recordId}`,
        updateRecordDto
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting a record
export const deleteRecord = createAsyncThunk(
  "records/delete",
  async (recordId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/records/delete/${recordId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching records by tags
export const getRecordsByTags = createAsyncThunk(
  "records/getByTags",
  async (tags, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/records/filter-by-tags",
        tags
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Record slice
const recordSlice = createSlice({
  name: "records",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create record
      .addCase(createRecord.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.records.push(action.payload);
      })
      .addCase(createRecord.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get record by ID
      .addCase(getRecordById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getRecordById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.record = action.payload;
      })
      .addCase(getRecordById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get records by element
      .addCase(getRecordsByElement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getRecordsByElement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.records = action.payload;
      })
      .addCase(getRecordsByElement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update record
      .addCase(updateRecord.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.records.findIndex(
          (record) => record.id === action.payload.id
        );
        if (index !== -1) {
          state.records[index] = action.payload;
        }
      })
      .addCase(updateRecord.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete record
      .addCase(deleteRecord.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.records = state.records.filter(
          (record) => record.id !== action.payload.id
        );
      })
      .addCase(deleteRecord.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get records by tags
      .addCase(getRecordsByTags.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getRecordsByTags.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.records = action.payload;
      })
      .addCase(getRecordsByTags.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default recordSlice.reducer;
