import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
// Initial state for structure slice
const initialState = {
  structures: [],
  status: "idle",
  error: null,
};

// Async thunk for creating a structure
export const createStructure = createAsyncThunk(
  "structures/createStructure",
  async (structureData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/structure/create",
        structureData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for getting structures by userId
export const getStructuresByUserId = createAsyncThunk(
  "structures/getStructuresByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/structure/user/${userId}`);
      return response.data.structures;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for getting a structure by ID
export const getStructure = createAsyncThunk(
  "structures/getStructure",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/structure/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating a structure
export const updateStructure = createAsyncThunk(
  "structures/updateStructure",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      console.log(updateData)
      const response = await axiosInstance.patch(
        `/structure/update/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting a structure
export const deleteStructure = createAsyncThunk(
  "structures/deleteStructure",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/structure/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for batch creating structures
export const createBatchStructures = createAsyncThunk(
  "structures/createBatchStructures",
  async (structures, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/structure/batch-create",
        structures
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for batch updating structures
export const updateBatchStructures = createAsyncThunk(
  "structures/updateBatchStructures",
  async (structures, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        "/structure/batch-update",
        structures
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for batch deleting structures
export const deleteBatchStructures = createAsyncThunk(
  "structures/deleteBatchStructures",
  async (ids, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete("/structure/batch-delete", {
        data: { ids },
      });
      return ids;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Structure slice
const structureSlice = createSlice({
  name: "structures",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create structure
      .addCase(createStructure.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createStructure.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.structures.push(action.payload);
      })
      .addCase(createStructure.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get structures by userId
      .addCase(getStructuresByUserId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getStructuresByUserId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.structures = action.payload; 
      })
      .addCase(getStructuresByUserId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get structure by ID
      .addCase(getStructure.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getStructure.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.structures = state.structures.map((structure) =>
          structure.id === action.payload.id ? action.payload : structure
        );
      })
      .addCase(getStructure.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update structure
      .addCase(updateStructure.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateStructure.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.structures = state.structures.map((structure) =>
          structure.id === action.payload.id ? action.payload : structure
        );
      })
      .addCase(updateStructure.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete structure
      .addCase(deleteStructure.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteStructure.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.structures = state.structures.filter(
          (structure) => structure.id !== action.payload
        );
      })
      .addCase(deleteStructure.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Batch create structures
      .addCase(createBatchStructures.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createBatchStructures.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.structures.push(...action.payload);
      })
      .addCase(createBatchStructures.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Batch update structures
      .addCase(updateBatchStructures.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateBatchStructures.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.structures = state.structures.map(
          (structure) =>
            action.payload.find((updated) => updated.id === structure.id) ||
            structure
        );
      })
      .addCase(updateBatchStructures.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Batch delete structures
      .addCase(deleteBatchStructures.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteBatchStructures.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.structures = state.structures.filter(
          (structure) => !action.payload.includes(structure.id)
        );
      })
      .addCase(deleteBatchStructures.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default structureSlice.reducer;
