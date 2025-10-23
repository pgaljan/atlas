import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../middleware/axiosInstance';

const initialState = {
  profile: null,
  status: 'idle',
  error: null,
  exportFile: null,
};

export const fetchCleansheetProfile = createAsyncThunk(
  'cleansheet/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/cleansheet/profile/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const upsertCleansheetProfile = createAsyncThunk(
  'cleansheet/upsertProfile',
  async ({ dto, userId } = {}, { rejectWithValue }) => {
    try {
      const config = userId ? { params: { userId } } : undefined;
      const res = await axiosInstance.post('/cleansheet/profile', dto, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const updateCleansheetProfile = createAsyncThunk(
  'cleansheet/updateProfile',
  async ({ userId, dto }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/cleansheet/profile/${userId}`, dto);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const deleteCleansheetProfile = createAsyncThunk(
  'cleansheet/deleteProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/cleansheet/profile/${userId}`);
      return { userId, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const importCleansheetProfile = createAsyncThunk(
  'cleansheet/importProfile',
  async ({ file, json, userId } = {}, { rejectWithValue }) => {
    try {
      const base = '/cleansheet/profile/import';
      const url = userId ? `${base}?userId=${encodeURIComponent(userId)}` : base;

      if (file) {
        const form = new FormData();
        form.append('file', file);
        const res = await axiosInstance.post(url, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
      }

      const res = await axiosInstance.post(url, json || {});
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const exportCleansheetProfile = createAsyncThunk(
  'cleansheet/exportProfile',
  async ({ userId, download } = {}, { rejectWithValue }) => {
    try {
      const url = `/cleansheet/profile/${userId}/export`;
      if (download) {
        const res = await axiosInstance.get(url, {
          params: { download: 'true' },
          responseType: 'blob',
        });

        const disposition = res.headers?.['content-disposition'] || res.headers?.['Content-Disposition'];
        let filename = `cleansheet_profile_${userId}.json`;
        if (disposition) {
          const match = disposition.match(/filename="?([^"]+)"?/);
          if (match) filename = match[1];
        }

        const blob = res.data;
        // blob.text() returns the textual content
        const text = await blob.text();

        try {
          const parsed = JSON.parse(text);
          return { filename, data: parsed };
        } catch {
          return { filename, dataText: text };
        }
      } else {
        const res = await axiosInstance.get(url);
        return res.data;
      }
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

const cleansheetSlice = createSlice({
  name: 'cleansheet',
  initialState,
  reducers: {
    resetCleansheetState: () => initialState,
    clearCleansheetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCleansheetProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCleansheetProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchCleansheetProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // upsert
      .addCase(upsertCleansheetProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(upsertCleansheetProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(upsertCleansheetProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // update
      .addCase(updateCleansheetProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateCleansheetProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(updateCleansheetProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // delete
      .addCase(deleteCleansheetProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteCleansheetProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { userId } = action.payload;
        if (state.profile && state.profile.userId === userId) {
          state.profile = null;
        }
      })
      .addCase(deleteCleansheetProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // import
      .addCase(importCleansheetProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(importCleansheetProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(importCleansheetProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // export
      .addCase(exportCleansheetProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(exportCleansheetProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && (action.payload.data || action.payload.dataText)) {
          state.exportFile = {
            filename: action.payload.filename,
            data: action.payload.data ?? null,
            dataText: action.payload.dataText ?? null,
          };
        } else {
          state.exportFile = { data: action.payload };
        }
      })
      .addCase(exportCleansheetProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetCleansheetState, clearCleansheetError } = cleansheetSlice.actions;
export default cleansheetSlice.reducer;
