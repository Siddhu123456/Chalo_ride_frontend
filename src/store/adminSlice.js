import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://192.168.3.86:8000/admin';


const getHeaders = () => {
  const adminKey = localStorage.getItem('rydo_admin_key'); 
  return { 
    headers: { 
      'x-admin-key': adminKey,
      'Content-Type': 'application/json'
    } 
  };
};

const extractErrorMessage = (err) => {
  const responseData = err.response?.data;
  if (responseData?.detail && Array.isArray(responseData.detail)) {
    return responseData.detail.map(e => `${e.loc[1]}: ${e.msg}`).join(', ');
  }
  return responseData?.detail || err.message || 'An unexpected error occurred';
};


export const fetchTenants = createAsyncThunk('admin/fetchTenants', async (_, { rejectWithValue }) => {
  try { return (await axios.get(`${API_URL}/tenants`, getHeaders())).data; } 
  catch (err) { return rejectWithValue(extractErrorMessage(err)); }
});

export const createTenant = createAsyncThunk('admin/createTenant', async (data, { rejectWithValue }) => {
  try { return (await axios.post(`${API_URL}/tenants`, data, getHeaders())).data; } 
  catch (err) { return rejectWithValue(extractErrorMessage(err)); }
});

export const fetchTenantCountries = createAsyncThunk('admin/fetchTenantCountries', async (tenantId, { rejectWithValue }) => {
  try { return { tenantId, countries: (await axios.get(`${API_URL}/tenants/${tenantId}/countries`, getHeaders())).data }; } 
  catch (err) { return rejectWithValue(extractErrorMessage(err)); }
});

export const addTenantCountry = createAsyncThunk('admin/addTenantCountry', async ({ tenantId, countryData }, { rejectWithValue }) => {
  try { return (await axios.post(`${API_URL}/tenants/${tenantId}/countries`, countryData, getHeaders())).data; } 
  catch (err) { return rejectWithValue(extractErrorMessage(err)); }
});




export const fetchTenantAdmins = createAsyncThunk(
  'admin/fetchTenantAdmins',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/tenant-admin/${tenantId}/admins`, getHeaders());
      return response.data.admins; 
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);


export const assignTenantAdmin = createAsyncThunk(
  'admin/assignTenantAdmin',
  async ({ tenantId, payload }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/tenant-admin/${tenantId}/admins`, payload, getHeaders());
      return response.data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);


export const removeTenantAdmin = createAsyncThunk(
  'admin/removeTenantAdmin',
  async ({ tenantId, userId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/tenant-admin/${tenantId}/admins/${userId}`, getHeaders());
      return userId; 
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);



const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    tenants: [],
    currentTenantCountries: [], 
    currentTenantAdmins: [], 
    loading: false,
    error: null,
    successMsg: null,
    isAuthenticated: !!localStorage.getItem('rydo_admin_key')
  },
  reducers: {
    adminLogin: (state, action) => {
      localStorage.setItem('rydo_admin_key', action.payload);
      state.isAuthenticated = true;
      state.error = null;
    },
    adminLogout: (state) => {
      localStorage.removeItem('rydo_admin_key');
      state.isAuthenticated = false;
      state.tenants = [];
    },
    clearAdminState: (state) => {
      state.error = null;
      state.successMsg = null;
      state.currentTenantCountries = [];
      state.currentTenantAdmins = []; 
    }
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchTenants.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTenants.fulfilled, (state, action) => { state.loading = false; state.tenants = action.payload; })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
        if (action.payload && typeof action.payload === 'string' && action.payload.includes("Unauthorized")) {
          state.isAuthenticated = false; localStorage.removeItem('rydo_admin_key');
        }
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.tenants.push(action.payload); state.successMsg = "Tenant created"; state.loading = false;
      })
      .addCase(fetchTenantCountries.fulfilled, (state, action) => { state.currentTenantCountries = action.payload.countries; state.loading = false; })
      .addCase(addTenantCountry.fulfilled, (state, action) => { state.currentTenantCountries.push(action.payload); state.successMsg = "Country added"; state.loading = false; })
      
      
      
      
      .addCase(fetchTenantAdmins.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTenantAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTenantAdmins = action.payload;
      })
      .addCase(fetchTenantAdmins.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      
      .addCase(assignTenantAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = "Admin assigned successfully";
        
        const index = state.currentTenantAdmins.findIndex(a => a.user_id === action.payload.user_id);
        if (index !== -1) {
          state.currentTenantAdmins[index] = action.payload;
        } else {
          state.currentTenantAdmins.push(action.payload);
        }
      })
      .addCase(assignTenantAdmin.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      
      .addCase(removeTenantAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = "Admin removed successfully";
        state.currentTenantAdmins = state.currentTenantAdmins.filter(a => a.user_id !== action.payload);
      })
      .addCase(removeTenantAdmin.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { adminLogin, adminLogout, clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;