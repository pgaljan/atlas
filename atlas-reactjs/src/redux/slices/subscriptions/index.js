import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

// Initial state
const initialState = {
  subscription: null,
  status: "idle",
  error: null,
};

// Fetch subscription by user ID
export const fetchSubscription = createAsyncThunk(
  "subscription/fetchSubscription",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/subscriptions/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update subscription plan
export const updateSubscriptionPlan = createAsyncThunk(
  "subscription/updateSubscriptionPlan",
  async ({ userId, planId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/subscriptions/${userId}/plan`, {
        planId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Subscription slice
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    resetSubscriptionState: (state) => {
      state.subscription = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscription
      .addCase(fetchSubscription.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscription = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update subscription plan
      .addCase(updateSubscriptionPlan.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscription = action.payload;
      })
      .addCase(updateSubscriptionPlan.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
