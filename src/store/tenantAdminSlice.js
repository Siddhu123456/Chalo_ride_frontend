import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/tenant-admin';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  },
});

/* ─────────────────────────────────────────────────────────────
   PROFILE
   Route: GET /tenant-admin/me/profile
   Returns: { user_id, full_name, phone, email, gender,
              tenant_id, tenant_name, countries: [...], created_on }
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   VERIFICATION THUNKS
───────────────────────────────────────────────────────────── */

// Route: GET /tenant-admin/fleets/pending
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

// Route: GET /tenant-admin/drivers/pending
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

// Route: GET /tenant-admin/vehicles/pending  (reserved for future backend route)
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

/**
 * Route: GET /tenant-admin/{type}/{id}/documents
 *   type='fleets'  → /tenant-admin/fleets/{fleet_id}/documents
 *   type='drivers' → /tenant-admin/drivers/{driver_id}/documents
 */
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

/**
 * Route: POST /tenant-admin/{type}/documents/{document_id}/verify
 *   type='fleets'  → /tenant-admin/fleets/documents/{docId}/verify
 *   type='drivers' → /tenant-admin/drivers/documents/{docId}/verify
 * Body:    { approve: bool }
 * Returns: { message, fleet_auto_approved | driver_auto_approved }
 *
 * We also pass entityId + type back in the result so the fulfilled handler
 * can re-fetch docs after a successful action, keeping the UI fresh.
 */
export const verifyDocument = createAsyncThunk(
  'tenantAdmin/verifyDoc',
  async ({ type, docId, approve, entityId }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(
        `${API_URL}/${type}/documents/${docId}/verify`,
        { approve },
        getHeaders()
      );
      // Re-fetch docs for the entity so the list reflects the new status
      if (entityId) {
        dispatch(fetchEntityDocs({ type, id: entityId }));
      }
      return { docId, approve, type, entityId, serverResponse: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? err.message);
    }
  }
);

/* ─────────────────────────────────────────────────────────────
   CITY THUNKS — verified against:
   app/routes/tenant_admin_tenant_setup_routes.py  (prefix /tenant-admin)
───────────────────────────────────────────────────────────── */

// Route: GET /tenant-admin/tenants/{tenant_id}/cities
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

// Route: GET /tenant-admin/{tenant_id}/countries/{country_code}/available-cities
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

/**
 * Route: POST /tenant-admin/{tenant_id}/countries/{country_code}/city
 * Body: { name, timezone, currency,
 *         fare_configs: [{ vehicle_category, base_fare, per_km_rate,
 *                          per_min_rate, minimum_fare, platform_commission_percent }] }
 */
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

// Route: GET /tenant-admin/{tenant_id}/cities/{city_id}/fare-configs
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

// Route: PUT /tenant-admin/{tenant_id}/fare-config/{fare_config_id}
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

/* ─────────────────────────────────────────────────────────────
   SLICE
───────────────────────────────────────────────────────────── */

/*
  Action types that manage their own loading/error and must be
  excluded from the global addMatcher sweep.
*/
const EXCLUDED_FROM_GLOBAL_MATCHER = [
  'tenantAdmin/fetchProfile',
  'tenantAdmin/fetchCityFareConfigs',
];

const isExcluded = (actionType) =>
  EXCLUDED_FROM_GLOBAL_MATCHER.some((prefix) => actionType.startsWith(prefix));

const tenantAdminSlice = createSlice({
  name: 'tenantAdmin',
  initialState: {
    /* ── Profile (isolated loading/error) ── */
    profile: null,
    profileLoading: false,
    profileError: null,

    /* ── Verification queues ── */
    pendingFleets: [],
    pendingDrivers: [],
    pendingVehicles: [],
    activeDocs: [],          // documents for currently-selected entity

    /* ── City / Fare ── */
    cities: [],
    availableCities: [],
    cityFareConfigs: [],

    /* ── Global UI ── */
    loading: false,
    fareLoading: false,
    error: null,
    successMsg: null,
  },

  reducers: {
    clearTenantState(state) {
      state.error      = null;
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
  },

  extraReducers: (builder) => {
    builder

      /* ── Profile — fully isolated ── */
      .addCase(fetchTenantAdminProfile.pending, (s) => {
        s.profileLoading = true;
        s.profileError   = null;
      })
      .addCase(fetchTenantAdminProfile.fulfilled, (s, a) => {
        s.profileLoading = false;
        s.profile        = a.payload;
      })
      .addCase(fetchTenantAdminProfile.rejected, (s, a) => {
        s.profileLoading = false;
        s.profileError   = a.payload ?? 'Failed to load profile';
      })

      /* ── Verification queues ── */
      .addCase(fetchPendingFleets.fulfilled,   (s, a) => { s.pendingFleets   = a.payload; })
      .addCase(fetchPendingDrivers.fulfilled,  (s, a) => { s.pendingDrivers  = a.payload; })
      .addCase(fetchPendingVehicles.fulfilled, (s, a) => { s.pendingVehicles = a.payload; })

      /* ── Entity docs ── */
      .addCase(fetchEntityDocs.fulfilled, (s, a) => { s.activeDocs = a.payload; })

      /* ── Verify document:
            Optimistically update the specific doc's status in activeDocs
            so the Approve/Reject buttons disappear immediately.
            The subsequent fetchEntityDocs (dispatched inside the thunk)
            will overwrite with the real server state. ── */
      .addCase(verifyDocument.fulfilled, (s, a) => {
        const { docId, approve } = a.payload;
        const newStatus          = approve ? 'APPROVED' : 'REJECTED';
        const idx = s.activeDocs.findIndex((d) => d.document_id === docId);
        if (idx !== -1) {
          s.activeDocs[idx] = { ...s.activeDocs[idx], verification_status: newStatus };
        }
      })

      /* ── Cities ── */
      .addCase(fetchTenantCities.fulfilled,    (s, a) => { s.cities          = a.payload; })
      .addCase(fetchAvailableCities.fulfilled, (s, a) => { s.availableCities = a.payload; })

      .addCase(addCityWithFare.fulfilled, (s) => {
        s.availableCities = [];
        s.successMsg      = 'City onboarded successfully with fare configurations.';
      })

      /* ── Fare configs (isolated loading) ── */
      .addCase(fetchCityFareConfigs.pending,   (s) => { s.fareLoading = true; })
      .addCase(fetchCityFareConfigs.fulfilled, (s, a) => {
        s.cityFareConfigs = a.payload;
        s.fareLoading     = false;
      })
      .addCase(fetchCityFareConfigs.rejected, (s) => { s.fareLoading = false; })

      .addCase(updateFareConfig.fulfilled, (s, a) => {
        const idx = s.cityFareConfigs.findIndex(
          (f) => f.fare_config_id === a.payload.fare_config_id
        );
        if (idx !== -1) s.cityFareConfigs[idx] = a.payload;
        s.successMsg = 'Fare config updated successfully.';
      })

      /* ── Global loading / error matchers
         Exclude: profile thunk (has its own loading) and fareConfig thunk
         (has its own fareLoading) so we don't double-set them. ── */
      .addMatcher(
        (a) => a.type.endsWith('/pending')   && !isExcluded(a.type),
        (s) => { s.loading = true; s.error = null; }
      )
      .addMatcher(
        (a) => a.type.endsWith('/fulfilled') && !isExcluded(a.type),
        (s) => { s.loading = false; }
      )
      .addMatcher(
        (a) => a.type.endsWith('/rejected')  && !isExcluded(a.type),
        (s, a) => { s.loading = false; s.error = a.payload ?? 'Request failed.'; }
      );
  },
});

export const {
  clearTenantState,
  resetActiveDocs,
  clearAvailableCities,
  clearCityFareConfigs,
} = tenantAdminSlice.actions;

export default tenantAdminSlice.reducer;