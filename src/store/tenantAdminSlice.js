import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://192.168.3.86:8000/tenant-admin';
// const API_URL = 'http://localhost:8000/tenant-admin';
const WALLET_API_URL = 'http://192.168.3.86:8000/wallet';
// const WALLET_API_URL = 'http://localhost:8000/wallet';
const SETTLEMENT_API_URL = 'http://192.168.3.86:8000/tenant/settlements';
// const SETTLEMENT_API_URL = 'http://localhost:8000/tenant/settlements';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  },
});


export const fetchTenantAdminProfile = createAsyncThunk(
  'tenantAdmin/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return (await axios.get(`${API_URL}/me/profile`, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchPendingFleets = createAsyncThunk(
  'tenantAdmin/pendingFleets',
  async (_, { rejectWithValue }) => {
    try {
      return (await axios.get(`${API_URL}/fleets/pending`, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchPendingDrivers = createAsyncThunk(
  'tenantAdmin/pendingDrivers',
  async (_, { rejectWithValue }) => {
    try {
      return (await axios.get(`${API_URL}/drivers/pending`, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);

export const fetchPendingVehicles = createAsyncThunk(
  'tenantAdmin/pendingVehicles',
  async (_, { rejectWithValue }) => {
    try {
      return (await axios.get(`${API_URL}/vehicles/pending`, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchEntityDocs = createAsyncThunk(
  'tenantAdmin/fetchDocs',
  async ({ type, id }, { rejectWithValue }) => {
    try {
      return (await axios.get(`${API_URL}/${type}/${id}/documents`, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const verifyDocument = createAsyncThunk(
  'tenantAdmin/verifyDoc',
  async ({ type, docId, approve, entityId }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(
        `${API_URL}/${type}/documents/${docId}/verify`,
        { approve },
        getHeaders()
      );
      
      if (entityId) {
        dispatch(fetchEntityDocs({ type, id: entityId }));
      }

      if (type === 'fleets') {
        dispatch(fetchPendingFleets());
      } else if (type === 'drivers') {
        dispatch(fetchPendingDrivers());
      } else if (type === 'vehicles') {
        dispatch(fetchPendingVehicles());
      }
      return { docId, approve, type, entityId, serverResponse: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchTenantCities = createAsyncThunk(
  'tenantAdmin/fetchTenantCities',
  async (tenantId, { rejectWithValue }) => {
    try {
      return (await axios.get(`${API_URL}/tenants/${tenantId}/cities`, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);

export const fetchAvailableCities = createAsyncThunk(
  'tenantAdmin/fetchAvailableCities',
  async ({ tenantId, countryCode }, { rejectWithValue }) => {
    try {
      return (
        await axios.get(
          `${API_URL}/${tenantId}/countries/${countryCode}/available-cities`,
          getHeaders()
        )
      ).data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);

export const addCityWithFare = createAsyncThunk(
  'tenantAdmin/addCityWithFare',
  async ({ tenantId, countryCode, body }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(
        `${API_URL}/${tenantId}/countries/${countryCode}/city`,
        body,
        getHeaders()
      );
      dispatch(fetchTenantCities(tenantId));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);

export const fetchCityFareConfigs = createAsyncThunk(
  'tenantAdmin/fetchCityFareConfigs',
  async ({ tenantId, cityId }, { rejectWithValue }) => {
    try {
      return (
        await axios.get(
          `${API_URL}/${tenantId}/cities/${cityId}/fare-configs`,
          getHeaders()
        )
      ).data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);

export const updateFareConfig = createAsyncThunk(
  'tenantAdmin/updateFareConfig',
  async ({ tenantId, fareConfigId, body }, { rejectWithValue }) => {
    try {
      return (
        await axios.put(
          `${API_URL}/${tenantId}/fare-config/${fareConfigId}`,
          body,
          getHeaders()
        )
      ).data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchVerifiedFleets = createAsyncThunk(
  'tenantAdmin/fetchVerifiedFleets',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${SETTLEMENT_API_URL}/fleet/verified_fleets`, getHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchTenantWallet = createAsyncThunk(
  'tenantAdmin/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${WALLET_API_URL}/me`, getHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchTenantWalletTransactions = createAsyncThunk(
  'tenantAdmin/fetchWalletTransactions',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${WALLET_API_URL}/transactions?page=${page}&limit=${limit}`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);




export const fetchFleetPendingCommission = createAsyncThunk(
  'tenantAdmin/fetchFleetPendingCommission',
  async (fleetId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${SETTLEMENT_API_URL}/fleet/${fleetId}/pending-commission`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchFleetUnsettledTrips = createAsyncThunk(
  'tenantAdmin/fetchFleetUnsettledTrips',
  async (fleetId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${SETTLEMENT_API_URL}/fleet/${fleetId}/unsettled-trips`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const createFleetSettlement = createAsyncThunk(
  'tenantAdmin/createFleetSettlement',
  async (fleetId, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(
        `${SETTLEMENT_API_URL}/fleet/${fleetId}`,
        {},
        getHeaders()
      );
      
      dispatch(fetchFleetSettlementHistory(fleetId));
      dispatch(fetchFleetPendingCommission(fleetId));
      dispatch(fetchTenantWallet());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchFleetSettlementHistory = createAsyncThunk(
  'tenantAdmin/fetchFleetSettlementHistory',
  async (fleetId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${SETTLEMENT_API_URL}/fleet/${fleetId}/history`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchSettlementDetails = createAsyncThunk(
  'tenantAdmin/fetchSettlementDetails',
  async (settlementId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${SETTLEMENT_API_URL}/${settlementId}`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);


export const fetchSettlementTrips = createAsyncThunk(
  'tenantAdmin/fetchSettlementTrips',
  async (settlementId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${SETTLEMENT_API_URL}/${settlementId}/trips`,
        getHeaders()
      );
      return { settlementId, trips: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);




const EXCLUDED_FROM_GLOBAL_MATCHER = [
  'tenantAdmin/fetchProfile',
  'tenantAdmin/fetchCityFareConfigs',
];

const isExcluded = (actionType) =>
  EXCLUDED_FROM_GLOBAL_MATCHER.some((prefix) => actionType.startsWith(prefix));

const tenantAdminSlice = createSlice({
  name: 'tenantAdmin',
  initialState: {
    
    profile: null,
    profileLoading: false,
    profileError: null,

    
    pendingFleets: [],
    pendingDrivers: [],
    pendingVehicles: [],
    activeDocs: [],          

    
    verifiedFleets: [],      

    
    cities: [],
    availableCities: [],
    cityFareConfigs: [],

    
    wallet: null,
    transactions: [],
    transactionsPagination: {
      page: 1,
      limit: 20,
      total: 0,
    },

    
    selectedFleetId: null,
    fleetPendingCommission: null,
    fleetUnsettledTrips: [],
    fleetSettlementHistory: [],
    selectedSettlementDetails: null,
    selectedSettlementTrips: [],

    
    loading: false,
    fareLoading: false,
    error: null,
    successMsg: null,
  },

  reducers: {
    clearTenantState(state) {
      state.error = null;
      state.successMsg = null;
    },
    resetActiveDocs(state) {
      state.activeDocs = [];
    },
    clearAvailableCities(state) {
      state.availableCities = [];
    },
    clearCityFareConfigs(state) {
      state.cityFareConfigs = [];
    },
    setSelectedFleetId(state, action) {
      state.selectedFleetId = action.payload;
      
      state.fleetPendingCommission = null;
      state.fleetUnsettledTrips = [];
      state.fleetSettlementHistory = [];
    },
    clearSettlementDetails(state) {
      state.selectedSettlementDetails = null;
      state.selectedSettlementTrips = [];
    },
  },

  extraReducers: (builder) => {
    builder

      
      .addCase(fetchTenantAdminProfile.pending, (s) => {
        s.profileLoading = true;
        s.profileError = null;
      })
      .addCase(fetchTenantAdminProfile.fulfilled, (s, a) => {
        s.profileLoading = false;
        s.profile = a.payload;
      })
      .addCase(fetchTenantAdminProfile.rejected, (s, a) => {
        s.profileLoading = false;
        s.profileError = a.payload ?? 'Failed to load profile';
      })

      
      .addCase(fetchPendingFleets.fulfilled, (s, a) => { s.pendingFleets = a.payload; })
      .addCase(fetchPendingDrivers.fulfilled, (s, a) => { s.pendingDrivers = a.payload; })
      .addCase(fetchPendingVehicles.fulfilled, (s, a) => { s.pendingVehicles = a.payload; })

      .addCase(fetchVerifiedFleets.fulfilled, (s, a) => { s.verifiedFleets = a.payload; })

      .addCase(fetchEntityDocs.fulfilled, (s, a) => { s.activeDocs = a.payload; })

      .addCase(verifyDocument.fulfilled, (s, a) => {
        const { docId, approve } = a.payload;
        const newStatus = approve ? 'APPROVED' : 'REJECTED';
        const idx = s.activeDocs.findIndex((d) => d.document_id === docId);
        if (idx !== -1) {
          s.activeDocs[idx] = { ...s.activeDocs[idx], verification_status: newStatus };
        }
      })

      
      .addCase(fetchTenantCities.fulfilled, (s, a) => { s.cities = a.payload; })
      .addCase(fetchAvailableCities.fulfilled, (s, a) => { s.availableCities = a.payload; })

      .addCase(addCityWithFare.fulfilled, (s) => {
        s.availableCities = [];
        s.successMsg = 'City onboarded successfully with fare configurations.';
      })

      
      .addCase(fetchCityFareConfigs.pending, (s) => { s.fareLoading = true; })
      .addCase(fetchCityFareConfigs.fulfilled, (s, a) => {
        s.cityFareConfigs = a.payload;
        s.fareLoading = false;
      })
      .addCase(fetchCityFareConfigs.rejected, (s) => { s.fareLoading = false; })

      .addCase(updateFareConfig.fulfilled, (s, a) => {
        const idx = s.cityFareConfigs.findIndex(
          (f) => f.fare_config_id === a.payload.fare_config_id
        );
        if (idx !== -1) s.cityFareConfigs[idx] = a.payload;
        s.successMsg = 'Fare config updated successfully.';
      })

      
      .addCase(fetchTenantWallet.fulfilled, (s, a) => {
        s.wallet = a.payload;
      })

      .addCase(fetchTenantWalletTransactions.fulfilled, (s, a) => {
        s.transactions = a.payload.transactions || [];
        s.transactionsPagination = {
          page: a.payload.page,
          limit: a.payload.limit,
          total: a.payload.total,
        };
      })

      
      .addCase(fetchFleetPendingCommission.fulfilled, (s, a) => {
        s.fleetPendingCommission = a.payload;
      })

      .addCase(fetchFleetUnsettledTrips.fulfilled, (s, a) => {
        s.fleetUnsettledTrips = a.payload || [];
      })

      .addCase(createFleetSettlement.fulfilled, (s) => {
        s.successMsg = 'Settlement created successfully';
      })

      .addCase(fetchFleetSettlementHistory.fulfilled, (s, a) => {
        s.fleetSettlementHistory = a.payload || [];
      })

      .addCase(fetchSettlementDetails.fulfilled, (s, a) => {
        s.selectedSettlementDetails = a.payload;
      })

      .addCase(fetchSettlementTrips.fulfilled, (s, a) => {
        s.selectedSettlementTrips = a.payload.trips || [];
      })

      .addMatcher(
        (a) => a.type.endsWith('/pending') && !isExcluded(a.type),
        (s) => { s.loading = true; s.error = null; }
      )
      .addMatcher(
        (a) => a.type.endsWith('/fulfilled') && !isExcluded(a.type),
        (s) => { s.loading = false; }
      )
      .addMatcher(
        (a) => a.type.endsWith('/rejected') && !isExcluded(a.type),
        (s, a) => { s.loading = false; s.error = a.payload ?? 'Request failed.'; }
      );
  },
});

export const {
  clearTenantState,
  resetActiveDocs,
  clearAvailableCities,
  clearCityFareConfigs,
  setSelectedFleetId,
  clearSettlementDetails,
} = tenantAdminSlice.actions;

export default tenantAdminSlice.reducer;