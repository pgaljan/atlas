import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
import Cookies from "js-cookie";

// Initial state for privacy policy slice
const initialState = {
  status: "idle",
  error: null,
  message: null,
  policy: null,
  needsToAccept: false,
  acknowledged: false,
};

// Async thunk to fetch Privacy Policy
export const fetchPrivacyPolicy = createAsyncThunk(
  "privacyPolicy/fetchPrivacyPolicy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/policy");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to save or update Privacy Policy
export const saveOrUpdatePrivacyPolicy = createAsyncThunk(
  "privacyPolicy/saveOrUpdatePrivacyPolicy",
  async (policyData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/policy/save", policyData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to check if user needs to accept the policy
export const checkPolicyAcceptance = createAsyncThunk(
  "privacyPolicy/checkPolicyAcceptance",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/policy/check-acceptance/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// **New** Async thunk to acknowledge the policy
export const acknowledgePolicy = createAsyncThunk(
  "privacyPolicy/acknowledgePolicy",
  async (_, { rejectWithValue }) => {
    try {
      const userId = Cookies.get("atlas_userId");
      const response = await axiosInstance.post(
        `/policy/acknowledge/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const privacyPolicySlice = createSlice({
  name: "privacyPolicy",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchPrivacyPolicy
      .addCase(fetchPrivacyPolicy.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPrivacyPolicy.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.policy = action.payload.policy;
      })
      .addCase(fetchPrivacyPolicy.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // saveOrUpdatePrivacyPolicy
      .addCase(saveOrUpdatePrivacyPolicy.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveOrUpdatePrivacyPolicy.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
        state.policy = action.payload.policy;
      })
      .addCase(saveOrUpdatePrivacyPolicy.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // checkPolicyAcceptance
      .addCase(checkPolicyAcceptance.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkPolicyAcceptance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.needsToAccept = action.payload.needsToAccept;
      })
      .addCase(checkPolicyAcceptance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // acknowledgePolicy
      .addCase(acknowledgePolicy.pending, (state) => {
        state.status = "loading";
      })
      .addCase(acknowledgePolicy.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.acknowledged = true;
        state.message = action.payload.message;
      })
      .addCase(acknowledgePolicy.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default privacyPolicySlice.reducer;
