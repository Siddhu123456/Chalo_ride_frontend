import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/tenant-admin';
const getHeaders = () => ({
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
    'Content-Type': 'application/json' 
  }
});

/* --- ASYNC THUNKS --- */

export const fetchPendingFleets = createAsyncThunk('tenant/pendingFleets', async (_, { rejectWithValue }) => {
  try { return (await axios.get(`${API_URL}/fleets/pending`, getHeaders())).data; }
  catch (err) { return rejectWithValue(err.response?.data?.detail); }
});

export const fetchPendingDrivers = createAsyncThunk('tenant/pendingDrivers', async (_, { rejectWithValue }) => {
  try { return (await axios.get(`${API_URL}/drivers/pending`, getHeaders())).data; }
  catch (err) { return rejectWithValue(err.response?.data?.detail); }
});

export const fetchPendingVehicles = createAsyncThunk('tenant/pendingVehicles', async (_, { rejectWithValue }) => {
  try { return (await axios.get(`${API_URL}/vehicles/pending`, getHeaders())).data; }
  catch (err) { return rejectWithValue(err.response?.data?.detail); }
});

export const fetchEntityDocs = createAsyncThunk('tenant/fetchDocs', async ({ type, id }, { rejectWithValue }) => {
  try { return (await axios.get(`${API_URL}/${type}/${id}/documents`, getHeaders())).data; }
  catch (err) { return rejectWithValue(err.response?.data?.detail); }
});

export const verifyDocument = createAsyncThunk('tenant/verifyDoc', async ({ type, docId, approve }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/${type}/documents/${docId}/verify`, { approve }, getHeaders());
    return { docId, approve, res: res.data };
  } catch (err) { return rejectWithValue(err.response?.data?.detail); }
});

//  FIXED EXPORT NAME
export const fetchTenantCities = createAsyncThunk('tenant/fetchTenantCities', async (tenantId, { rejectWithValue }) => {
  try { return (await axios.get(`${API_URL}/tenants/${tenantId}/cities`, getHeaders())).data; }
  catch (err) { return rejectWithValue(err.response?.data?.detail); }
});

// FIXED EXPORT NAME
export const bulkAddCities = createAsyncThunk('tenant/bulkAddCities', async ({ tenantId, countryCode, cities }, { rejectWithValue, dispatch }) => {
  try {
    const res = await axios.post(`${API_URL}/tenants/${tenantId}/countries/${countryCode}/cities`, { cities }, getHeaders());
    dispatch(fetchTenantCities(tenantId)); // Refresh list
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.detail); }
});

const tenantAdminSlice = createSlice({
  name: 'tenantAdmin',
  initialState: {
    pendingFleets: [], pendingDrivers: [], pendingVehicles: [],
    activeDocs: [], cities: [],
    loading: false, error: null, successMsg: null
  },
  reducers: {
    clearTenantState: (state) => { state.error = null; state.successMsg = null; },
    resetActiveDocs: (state) => { state.activeDocs = []; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingFleets.fulfilled, (state, action) => { state.pendingFleets = action.payload; })
      .addCase(fetchPendingDrivers.fulfilled, (state, action) => { state.pendingDrivers = action.payload; })
      .addCase(fetchPendingVehicles.fulfilled, (state, action) => { state.pendingVehicles = action.payload; })
      .addCase(fetchEntityDocs.fulfilled, (state, action) => { state.activeDocs = action.payload; })
      .addCase(fetchTenantCities.fulfilled, (state, action) => { state.cities = action.payload; })
      .addMatcher(a => a.type.endsWith('/pending'), (state) => { state.loading = true; state.error = null; })
      .addMatcher(a => a.type.endsWith('/fulfilled'), (state) => { state.loading = false; })
      .addMatcher(a => a.type.endsWith('/rejected'), (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { clearTenantState, resetActiveDocs } = tenantAdminSlice.actions;
export default tenantAdminSlice.reducer;