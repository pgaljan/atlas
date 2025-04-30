import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
import Cookies from "js-cookie";

// Initial state for terms of service slice
const initialState = {
  status: "idle",
  error: null,
  message: null,
  terms: null,
};

// Async thunk to fetch Terms of Service
export const fetchTermsOfService = createAsyncThunk(
  "termsOfService/fetchTermsOfService",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/terms-of-service");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to save or update Terms of Service
export const saveOrUpdateTermsOfService = createAsyncThunk(
  "termsOfService/saveOrUpdateTermsOfService",
  async (termsData, { rejectWithValue }) => {
    try {
      const userId = Cookies.get("atlas_userId");
      if (!userId) {
        throw new Error("User not authenticated. No userId found in cookies.");
      }

      const response = await axiosInstance.post(
        "/terms-of-service/save",
        termsData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Terms of Service slice
const termsOfServiceSlice = createSlice({
  name: "termsOfService",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTermsOfService
      .addCase(fetchTermsOfService.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTermsOfService.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.terms = action.payload;
      })
      .addCase(fetchTermsOfService.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // saveOrUpdateTermsOfService
      .addCase(saveOrUpdateTermsOfService.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveOrUpdateTermsOfService.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
        state.terms = action.payload.terms;
      })
      .addCase(saveOrUpdateTermsOfService.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default termsOfServiceSlice.reducer;
