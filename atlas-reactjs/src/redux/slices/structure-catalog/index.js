import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

const initialState = {
  catalogs: [],
  status: "idle",
  error: null,
};

// Fetch all catalogs
export const fetchCatalogs = createAsyncThunk(
  "catalogs/fetchCatalogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/structure-catalogs");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch catalog by ID
export const fetchCatalogById = createAsyncThunk(
  "catalogs/fetchCatalogById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/structure-catalogs/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch catalogs by user tier
export const fetchCatalogsByUserTier = createAsyncThunk(
  "catalogs/fetchCatalogsByUserTier",
  async (userTier, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/structure-catalogs/tier/${userTier}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create catalog
export const createCatalog = createAsyncThunk(
  "catalogs/createCatalog",
  async (createCatalogDto, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/structure-catalogs/create",
        createCatalogDto
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update catalog
export const updateCatalog = createAsyncThunk(
  "catalogs/updateCatalog",
  async ({ id, updateCatalogDto }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/structure-catalogs/update/${id}`,
        updateCatalogDto
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete catalog
export const deleteCatalog = createAsyncThunk(
  "catalogs/deleteCatalog",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/structure-catalogs/delete/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const catalogsSlice = createSlice({
  name: "catalogs",
  initialState,
  reducers: {
    resetCatalogsState: (state) => {
      state.catalogs = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchCatalogs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCatalogs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.catalogs = action.payload;
      })
      .addCase(fetchCatalogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchCatalogById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCatalogById.fulfilled, (state, action) => {
        state.status = "succeeded";
        const catalog = action.payload;
        const existingIndex = state.catalogs.findIndex(
          (c) => c.id === catalog.id
        );
        if (existingIndex !== -1) {
          state.catalogs[existingIndex] = catalog;
        } else {
          state.catalogs.push(catalog);
        }
      })
      .addCase(fetchCatalogById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch By User Tier
      .addCase(fetchCatalogsByUserTier.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCatalogsByUserTier.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.catalogs = action.payload;
      })
      .addCase(fetchCatalogsByUserTier.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create
      .addCase(createCatalog.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCatalog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.catalogs.push(action.payload);
      })
      .addCase(createCatalog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update
      .addCase(updateCatalog.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCatalog.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedCatalog = action.payload;
        const index = state.catalogs.findIndex(
          (c) => c.id === updatedCatalog.id
        );
        if (index !== -1) {
          state.catalogs[index] = updatedCatalog;
        }
      })
      .addCase(updateCatalog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteCatalog.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCatalog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.catalogs = state.catalogs.filter((c) => c.id !== action.meta.arg);
      })
      .addCase(deleteCatalog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetCatalogsState } = catalogsSlice.actions;
export default catalogsSlice.reducer;
