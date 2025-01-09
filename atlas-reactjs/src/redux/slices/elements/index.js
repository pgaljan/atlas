import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";
// Initial state for the element slice
const initialState = {
  elements: [],
  selectedElement: null,
  status: "idle",
  error: null,
};

// Async thunk for creating an element
export const createElement = createAsyncThunk(
  "element/create",
  async (createElementDto, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/element/create",
        createElementDto
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching all elements
export const fetchElements = createAsyncThunk(
  "element/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/element");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching a single element by ID
export const fetchElementById = createAsyncThunk(
  "element/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/element/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating an element
export const updateElement = createAsyncThunk(
  "element/update",
  async ({ id, updateElementDto }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/element/update/${id}`,
        updateElementDto
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting an element
export const deleteElement = createAsyncThunk(
  "element/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/element/delete/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for reparenting elements
export const reparentElements = createAsyncThunk(
  "element/reparent",
  async (reparentElementsDto, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/element/reparent",
        reparentElementsDto
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Element slice
const elementSlice = createSlice({
  name: "element",
  initialState,
  reducers: {
    clearSelectedElement: (state) => {
      state.selectedElement = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create element
      .addCase(createElement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createElement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.elements.push(action.payload);
      })
      .addCase(createElement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch all elements
      .addCase(fetchElements.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchElements.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.elements = action.payload;
      })
      .addCase(fetchElements.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch element by ID
      .addCase(fetchElementById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchElementById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedElement = action.payload;
      })
      .addCase(fetchElementById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update element
      .addCase(updateElement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateElement.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.elements.findIndex(
          (element) => element.id === action.payload.id
        );
        if (index !== -1) {
          state.elements[index] = action.payload;
        }
      })
      .addCase(updateElement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete element
      .addCase(deleteElement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteElement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.elements = state.elements.filter(
          (element) => element.id !== action.meta.arg
        );
      })
      .addCase(deleteElement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Reparent elements
      .addCase(reparentElements.pending, (state) => {
        state.status = "loading";
      })
      .addCase(reparentElements.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Optionally update local elements based on reparenting logic
      })
      .addCase(reparentElements.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearSelectedElement } = elementSlice.actions;
export default elementSlice.reducer;
