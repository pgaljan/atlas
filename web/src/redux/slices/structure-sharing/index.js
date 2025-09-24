import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../../middleware/axiosInstance';

const initialState = {
  shares: [],
  pendingInvitations: [],
  links: [],
  collaborators: [],
  sharedStructures: [], 
  currentUser: null,
  structureOwner: null,
  status: 'idle',
  error: null,
  message: null,
  loading: {
    shares: false,
    collaborators: false,
    pendingInvitations: false,
    links: false,
    mutations: false,
  },
};

export const fetchSharesForStructure = createAsyncThunk(
  'structureShares/fetchForStructure',
  async (structureId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/structure-shares/structure/${structureId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchCollaborators = createAsyncThunk(
  'structureShares/fetchCollaborators',
  async (structureId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/structure-shares/collaborators/${structureId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchPendingInvitations = createAsyncThunk(
  'structureShares/fetchPendingInvitations',
  async (structureId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/structure-shares/pending/${structureId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchShareableLinks = createAsyncThunk(
  'structureShares/fetchShareableLinks',
  async (structureId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/structure-shares/links/${structureId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchSharedStructures = createAsyncThunk(
  'structureShares/fetchSharedStructures',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/structure-shares/shared-structures`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createShare = createAsyncThunk(
  'structureShares/create',
  async (dto, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/structure-shares`, dto);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
export const updateShareRole = createAsyncThunk(
  'structureShares/update',
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/structure-shares/${id}`, dto);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
export const removeShare = createAsyncThunk(
  'structureShares/remove',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/structure-shares/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const transferOwnership = createAsyncThunk(
  'structureShares/transferOwner',
  async ({ structureId, newOwnerUserId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/structure-shares/transfer-owner`, {
        structureId,
        newOwnerUserId,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const inviteUserToShare = createAsyncThunk(
  'structureShares/invite',
  async (dto, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/structure-shares/invite`, dto);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);


export const acceptInvitation = createAsyncThunk(
  'structureShares/acceptInvitation',
  async ({ id, token } = {}, { rejectWithValue }) => {
    try {
      if (!id && !token) {
        return rejectWithValue('Missing invitation id or token');
      }
      const path = id
        ? `/structure-shares/accept-invitation/${id}`
        : `/structure-shares/accept-invitation/${token}`;
      const res = await axiosInstance.post(path);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createShareLink = createAsyncThunk(
  'structureShares/createLink',
  async (dto, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/structure-shares/links`, dto);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
export const validateShareLink = createAsyncThunk(
  'structureShares/validateLink',
  async (token, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/structure-shares/links/validate/${token}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
export const revokeShareLink = createAsyncThunk(
  'structureShares/revokeLink',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(`/structure-shares/links/revoke/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
export const removeCollaborator = createAsyncThunk(
  'structureShares/removeInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/structure-shares/invitation/${invitationId}`);
      return invitationId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
export const removeCollaboratorByUser = createAsyncThunk(
  'structureShares/removeCollaboratorByUser',
  async ({ structureId, userId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/structure-shares/collaborator/${structureId}/${userId}`,
      );
      return { structureId, userId, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const thunkToStateKey = {
  fetchSharesForStructure: 'shares',
  fetchCollaborators: 'collaborators',
  fetchPendingInvitations: 'pendingInvitations',
  fetchShareableLinks: 'links',
  fetchSharedStructures: 'sharedStructures', 
};

const getThunkName = (actionType) => {
  const parts = actionType.split('/');
  return parts[1]; 
};

const getLoadingKey = (thunkName) => {
  const loadingMap = {
    fetchForStructure: 'shares',
    fetchCollaborators: 'collaborators',
    fetchPendingInvitations: 'pendingInvitations',
    fetchShareableLinks: 'links',
    fetchSharedStructures: 'shares',
    create: 'mutations',
    update: 'mutations',
    remove: 'mutations',
    invite: 'mutations',
    removeInvitation: 'mutations',
    removeCollaboratorByUser: 'mutations',
    createLink: 'mutations',
    revokeLink: 'mutations',
    transferOwner: 'mutations',
    acceptInvitation: 'mutations',
  };
  return loadingMap[thunkName] || 'mutations';
};

// --- SLICE ---
const structureSharesSlice = createSlice({
  name: 'structureShares',
  initialState,
  reducers: {
    clearSharesState: (state) => {
      state.message = null;
      state.error = null;
    },
    resetSharesData: (state) => {
      state.shares = [];
      state.collaborators = [];
      state.pendingInvitations = [];
      state.links = [];
      state.sharedStructures = [];
      state.error = null;
      state.message = null;
      state.status = 'idle';
      Object.keys(state.loading).forEach((key) => {
        state.loading[key] = false;
      });
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setStructureOwner: (state, action) => {
      state.structureOwner = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('structureShares/') && action.type.endsWith('/pending'),
        (state, action) => {
          const thunkName = getThunkName(action.type);
          const loadingKey = getLoadingKey(thunkName);

          state.loading[loadingKey] = true;
          state.error = null;

          if (
            [
              'fetchForStructure',
              'fetchCollaborators',
              'fetchPendingInvitations',
              'fetchShareableLinks',
              'fetchSharedStructures',
            ].includes(thunkName)
          ) {
            state.status = 'loading';
          }
        },
      )

      .addMatcher(
        (action) =>
          action.type.startsWith('structureShares/') && action.type.endsWith('/fulfilled'),
        (state, action) => {
          const thunkName = getThunkName(action.type);
          const loadingKey = getLoadingKey(thunkName);
          const stateKey = thunkToStateKey[thunkName];

          // Reset loading state
          state.loading[loadingKey] = false;
          state.status = 'succeeded';
          state.error = null;

          if (stateKey) {
            state[stateKey] = Array.isArray(action.payload) ? action.payload : [];
          }

          switch (thunkName) {
            case 'create':
              if (action.payload && !state.shares.find((s) => s.id === action.payload.id)) {
                state.shares.push(action.payload);
              }
              break;

            case 'update':
              if (action.payload) {
                const idx = state.shares.findIndex((s) => s.id === action.payload.id);
                if (idx !== -1) {
                  state.shares[idx] = { ...state.shares[idx], ...action.payload };
                }
                const collabIdx = state.collaborators.findIndex((c) => c.id === action.payload.id);
                if (collabIdx !== -1) {
                  state.collaborators[collabIdx] = {
                    ...state.collaborators[collabIdx],
                    ...action.payload,
                  };
                }
              }
              break;

            case 'remove':
              state.shares = state.shares.filter((s) => s.id !== action.payload);
              state.collaborators = state.collaborators.filter((c) => c.id !== action.payload);
              break;

            case 'invite':
              if (
                action.payload &&
                !state.pendingInvitations.find((inv) => inv.id === action.payload.id)
              ) {
                state.pendingInvitations.push(action.payload);
              }
              break;

            case 'removeInvitation':
              state.pendingInvitations = state.pendingInvitations.filter(
                (inv) => inv.id !== action.payload,
              );
              state.collaborators = state.collaborators.filter(
                (collab) => collab.id !== action.payload,
              );
              break;

            case 'createLink':
              if (action.payload && !state.links.find((l) => l.id === action.payload.id)) {
                state.links.push(action.payload);
              }
              break;

            case 'revokeLink':
              state.links = state.links.filter((l) => l.id !== action.payload);
              break;

            case 'transferOwner':
              state.message = 'Ownership transferred successfully';
              break;
            case 'removeCollaboratorByUser':
              if (action.payload) {
                const { structureId, userId } = action.payload;
                state.collaborators = state.collaborators.filter(
                  (collab) => !(collab.structureId === structureId && collab.userId === userId),
                );
              }
              break;

            case 'acceptInvitation':
              state.message = 'Invitation accepted successfully';
             
              break;

            default:
              break;
          }
        },
      )

      .addMatcher(
        (action) => action.type.startsWith('structureShares/') && action.type.endsWith('/rejected'),
        (state, action) => {
          const thunkName = getThunkName(action.type);
          const loadingKey = getLoadingKey(thunkName);

          state.loading[loadingKey] = false;
          state.status = 'failed';

          let errorMessage = 'An error occurred';
          if (action.payload) {
            if (typeof action.payload === 'string') {
              errorMessage = action.payload;
            } else if (action.payload.message) {
              errorMessage = action.payload.message;
            } else if (action.payload.error) {
              errorMessage = action.payload.error;
            }
          } else if (action.error?.message) {
            errorMessage = action.error.message;
          }

          state.error = errorMessage;
        },
      );
  },
});

export const { clearSharesState, resetSharesData, setCurrentUser, setStructureOwner } =
  structureSharesSlice.actions;
export default structureSharesSlice.reducer;
