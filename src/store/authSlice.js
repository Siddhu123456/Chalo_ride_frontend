import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// const API_URL = 'http://192.168.3.86:8000';
const API_URL = 'http://localhost:8000';

const getInitialRoles = () => {
  try {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  } catch {
    return [];
  }
};


export const fetchCountries = createAsyncThunk(
  'auth/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/countries/`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to load countries');
    }
  }
);


export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Registration failed');
    }
  }
);


export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Login failed');
    }
  }
);


export const selectRole = createAsyncThunk(
  'auth/selectRole',
  async ({ user_id, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/select-role`, { user_id, role });
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Role selection failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    roles: getInitialRoles(),  // ← read from localStorage on reload
    authStep: 'CREDENTIALS',
    countries: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetAuth: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.authStep = 'CREDENTIALS';
      state.roles = [];
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.roles = [];
      localStorage.removeItem('token');
      localStorage.removeItem('roles');  // ← clear roles on logout
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { user_id: action.payload.user_id };
        state.roles = action.payload.roles;
        state.authStep = 'ROLE_SELECT';
        // Store roles so they survive reload after selectRole
        localStorage.setItem('roles', JSON.stringify(action.payload.roles));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(selectRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectRole.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.success = true;
      })
      .addCase(selectRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchCountries.fulfilled, (state, action) => { state.countries = action.payload; });
  },
});

export const { resetAuth, logout } = authSlice.actions;
export default authSlice.reducer;