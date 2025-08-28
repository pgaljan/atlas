import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
// Initial state for the role slice
const initialState = {
  roles: [],
  status: "idle",
  error: null,
};

// Async thunk for creating a new role
export const createRole = createAsyncThunk(
  "roles/create",
  async (createRoleData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/role/create", createRoleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching all roles
export const fetchRoles = createAsyncThunk(
  "roles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/role");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching a single role by ID
export const fetchRole = createAsyncThunk(
  "roles/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/role/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating a role
export const updateRole = createAsyncThunk(
  "roles/update",
  async ({ id, updateRoleData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/role/update/${id}`,
        updateRoleData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting a role
export const deleteRole = createAsyncThunk(
  "roles/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/role/delete/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Role slice
const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create role
      .addCase(createRole.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch all roles
      .addCase(fetchRoles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch a single role
      .addCase(fetchRole.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRole.fulfilled, (state, action) => {
        state.status = "succeeded";
        const existingRole = state.roles.find(
          (role) => role.id === action.payload.id
        );
        if (!existingRole) {
          state.roles.push(action.payload);
        }
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update role
      .addCase(updateRole.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.roles.findIndex(
          (role) => role.id === action.payload.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete role
      .addCase(deleteRole.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.roles = state.roles.filter(
          (role) => role.id !== action.payload.id
        );
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default roleSlice.reducer;
