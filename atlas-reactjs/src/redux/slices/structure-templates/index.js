import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../middleware/axiosInstance";

// Initial state
const initialState = {
  templates: [],
  selectedTemplate: null,
  status: "idle",
  error: null,
  message: null,
};

export const createStructureTemplate = createAsyncThunk(
  "structureTemplates/create",
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/structure-templates/create-template`,
        templateData
      );
      return response.data.template;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const duplicateStructureTemplate = createAsyncThunk(
  "structureTemplates/duplicate",
  async ({ templateId, overrideData = {} }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/structure-templates/duplicate/${templateId}`,
        overrideData
      );
      return response.data.template;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTemplatesByWorkspace = createAsyncThunk(
  "structureTemplates/fetchByWorkspace",
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/structure-templates/workspace/${workspaceId}`
      );
      return response.data.templates;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTemplateById = createAsyncThunk(
  "structureTemplates/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/structure-templates/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStructureTemplate = createAsyncThunk(
  "structureTemplates/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(`/structure-templates/${id}`, data);
      return { id, ...data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteStructureTemplate = createAsyncThunk(
  "structureTemplates/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/structure-templates/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const useTemplateAsStructure = createAsyncThunk(
  "structureTemplates/useTemplate",
  async ({ templateId, overrides }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/structure-templates/${templateId}/use`,
        overrides
      );
      return response.data.structure;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const structureTemplatesSlice = createSlice({
  name: "structureTemplates",
  initialState,
  reducers: {
    clearTemplateState: (state) => {
      state.message = null;
      state.error = null;
      state.selectedTemplate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createStructureTemplate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createStructureTemplate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates.unshift(action.payload);
        state.message = "Template created";
      })
      .addCase(createStructureTemplate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Duplicate
      .addCase(duplicateStructureTemplate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(duplicateStructureTemplate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates.unshift(action.payload);
        state.message = "Template duplicated";
      })
      .addCase(duplicateStructureTemplate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch all by workspace
      .addCase(fetchTemplatesByWorkspace.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTemplatesByWorkspace.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = action.payload;
      })
      .addCase(fetchTemplatesByWorkspace.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch one by ID
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.selectedTemplate = action.payload;
      })

      // Update
      .addCase(updateStructureTemplate.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.templates.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          state.templates[index] = {
            ...state.templates[index],
            ...action.payload,
          };
        }
        state.message = "Template updated";
      })

      // Delete
      .addCase(deleteStructureTemplate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = state.templates.filter(
          (t) => t.id !== action.payload
        );
        state.message = "Template deleted";
      })

      // Use Template
      .addCase(useTemplateAsStructure.pending, (state) => {
        state.status = "loading";
      })
      .addCase(useTemplateAsStructure.fulfilled, (state) => {
        state.status = "succeeded";
        state.message = "Structure created from template";
      })
      .addCase(useTemplateAsStructure.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearTemplateState } = structureTemplatesSlice.actions;

export default structureTemplatesSlice.reducer;
