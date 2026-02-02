import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// 1. Fetch Countries (Existing)
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

// 2. Register User (Existing)
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

// 3. Login Step 1: Verify Credentials & Get Roles
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data; // Returns { user_id, roles: [] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Login failed');
    }
  }
);

// 4. Login Step 2: Select Role & Get Token
export const selectRole = createAsyncThunk(
  'auth/selectRole',
  async ({ user_id, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/select-role`, { user_id, role });
      // Save token to localStorage immediately
      localStorage.setItem('token', response.data.access_token);
      return response.data; // Returns { access_token }
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Role selection failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // Will store user_id
    token: localStorage.getItem('token') || null,
    roles: [], // Stores available roles during login flow
    authStep: 'CREDENTIALS', // 'CREDENTIALS' or 'ROLE_SELECT'
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
    }
  },
  extraReducers: (builder) => {
    builder
      /* Login Step 1 */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { user_id: action.payload.user_id };
        state.roles = action.payload.roles;
        state.authStep = 'ROLE_SELECT'; // Switch UI to role selection
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* Login Step 2 (Role Selection) */
      .addCase(selectRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectRole.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.success = true; // Trigger redirect in component
      })
      .addCase(selectRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      /* Register */
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      /* Countries */
      .addCase(fetchCountries.fulfilled, (state, action) => { state.countries = action.payload; });
  },
});

export const { resetAuth, logout } = authSlice.actions;
export default authSlice.reducer;