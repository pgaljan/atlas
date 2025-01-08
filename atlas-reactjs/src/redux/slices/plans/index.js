import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
// Initial state for plans slice
const initialState = {
  plans: [],
  status: "idle",
  error: null,
};

// Async thunk for fetching all plans
export const fetchPlans = createAsyncThunk(
  "plans/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/plans");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching a single plan by ID
export const fetchPlanById = createAsyncThunk(
  "plans/fetchPlanById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/plans/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for creating a new plan
export const createPlan = createAsyncThunk(
  "plans/createPlan",
  async (createPlanDto, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/plans/create", createPlanDto);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating a plan
export const updatePlan = createAsyncThunk(
  "plans/updatePlan",
  async ({ id, updatePlanDto }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/plans/update/${id}`,
        updatePlanDto
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting a plan
export const deletePlan = createAsyncThunk(
  "plans/deletePlan",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/plans/delete/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Plans slice
const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    resetPlansState: (state) => {
      state.plans = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch plans
      .addCase(fetchPlans.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch plan by ID
      .addCase(fetchPlanById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.status = "succeeded";
        const plan = action.payload;
        const existingIndex = state.plans.findIndex((p) => p.id === plan.id);
        if (existingIndex !== -1) {
          state.plans[existingIndex] = plan;
        } else {
          state.plans.push(plan);
        }
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create plan
      .addCase(createPlan.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.plans.push(action.payload);
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update plan
      .addCase(updatePlan.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedPlan = action.payload;
        const index = state.plans.findIndex(
          (plan) => plan.id === updatedPlan.id
        );
        if (index !== -1) {
          state.plans[index] = updatedPlan;
        }
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete plan
      .addCase(deletePlan.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.plans = state.plans.filter((plan) => plan.id !== action.meta.arg);
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetPlansState } = plansSlice.actions;
export default plansSlice.reducer;
