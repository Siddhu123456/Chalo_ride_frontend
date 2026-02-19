import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://192.168.3.86:8000/fleet-owner";
// const API_URL = "http://localhost:8000/fleet-owner";
const WALLET_API_URL = "http://192.168.3.86:8000/wallet";
// const WALLET_API_URL = "http://localhost:8000/wallet";


const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  if (!isMultipart) headers["Content-Type"] = "application/json";
  return { headers };
};

const getErrorMsg = (err, fallback = "Something went wrong") => {
  const data = err?.response?.data;

  if (Array.isArray(data)) {
    return data.map((e) => e?.msg).filter(Boolean).join(", ") || fallback;
  }

  if (typeof data?.detail === "string") return data.detail;

  if (Array.isArray(data?.detail)) {
    return data.detail.map((e) => e?.msg).filter(Boolean).join(", ") || fallback;
  }

  if (data?.detail && typeof data.detail === "object") {
    return JSON.stringify(data.detail);
  }

  return err?.message || fallback;
};

export const checkFleetStatus = createAsyncThunk(
  "fleet/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/me`, getHeaders());
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      return rejectWithValue(getErrorMsg(err, "Error checking status"));
    }
  }
);

export const fetchFleetTenants = createAsyncThunk(
  "fleet/fetchTenants",
  async (user_id, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/tenants`,
        { params: { user_id } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch tenants"));
    }
  }
);

export const applyForFleet = createAsyncThunk(
  "fleet/apply",
  async (payload, { rejectWithValue }) => {
    try {
      return (await axios.post(`${API_URL}/apply`, payload, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to apply"));
    }
  }
);

export const fetchDocStatus = createAsyncThunk(
  "fleet/fetchDocStatus",
  async (fleetId, { rejectWithValue }) => {
    try {
      return (await axios.get(`${API_URL}/fleets/${fleetId}/documents/status`, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch document status"));
    }
  }
);

export const uploadFleetDoc = createAsyncThunk(
  "fleet/uploadDoc",
  async ({ fleetId, docData }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("document_type", docData.document_type);
      formData.append("file", docData.file);
      if (docData.document_number) formData.append("document_number", docData.document_number);

      const res = await axios.post(
        `${API_URL}/fleets/${fleetId}/documents`,
        formData,
        getHeaders(true)
      );

      dispatch(fetchDocStatus(fleetId));
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to upload document"));
    }
  }
);

export const fetchFleetVehicles = createAsyncThunk(
  "fleet/fetchVehicles",
  async (fleetId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/fleets/${fleetId}/vehicles`, getHeaders());
      if (Array.isArray(res.data)) return res.data;
      return res.data?.vehicles || [];
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch vehicles"));
    }
  }
);

// GET /fleets/{fleet_id}/vehicles/unassigned — vehicles with no active driver assignment
export const fetchUnassignedVehicles = createAsyncThunk(
  "fleet/fetchUnassignedVehicles",
  async (fleetId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/fleets/${fleetId}/vehicles/unassigned`,
        getHeaders()
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch unassigned vehicles"));
    }
  }
);

export const addVehicle = createAsyncThunk(
  "fleet/addVehicle",
  async ({ fleetId, vehicleData }, { rejectWithValue }) => {
    try {
      return (await axios.post(`${API_URL}/fleets/${fleetId}/vehicles`, vehicleData, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to add vehicle"));
    }
  }
);

export const fetchVehicleDocStatus = createAsyncThunk(
  "fleet/fetchVehicleDocStatus",
  async (vehicleId, { rejectWithValue }) => {
    try {
      return (await axios.get(`${API_URL}/vehicles/${vehicleId}/documents/status`, getHeaders())).data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch vehicle doc status"));
    }
  }
);

export const uploadVehicleDoc = createAsyncThunk(
  "fleet/uploadVehicleDoc",
  async ({ vehicleId, docData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const formData = new FormData();
      formData.append("document_type", docData.document_type);
      formData.append("file", docData.file);

      const res = await axios.post(
        `${API_URL}/vehicles/${vehicleId}/documents`,
        formData,
        getHeaders(true)
      );

      dispatch(fetchVehicleDocStatus(vehicleId));

      const fleetId = getState()?.fleet?.fleet?.fleet_id;
      if (fleetId) dispatch(fetchFleetVehicles(fleetId));

      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Vehicle document upload failed"));
    }
  }
);

export const fetchFleetDrivers = createAsyncThunk(
  "fleet/fetchDrivers",
  async (fleetId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/fleets/${fleetId}/drivers`, getHeaders());
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch drivers"));
    }
  }
);

export const addDriverToFleet = createAsyncThunk(
  "fleet/addDriver",
  async ({ fleetId, payload }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(`${API_URL}/fleets/${fleetId}/drivers`, payload, getHeaders());
      dispatch(fetchFleetDrivers(fleetId));
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to add driver"));
    }
  }
);

export const fetchAvailableDrivers = createAsyncThunk(
  "fleet/fetchAvailableDrivers",
  async ({ fleetId, vehicleId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/fleets/${fleetId}/drivers/available?vehicle_id=${vehicleId}`,
        getHeaders()
      );
      return res.data?.drivers || [];
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch available drivers"));
    }
  }
);

export const assignDriverToVehicle = createAsyncThunk(
  "fleet/assignDriver",
  async ({ fleetId, payload }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(
        `${API_URL}/fleets/${fleetId}/assign-driver`,
        payload,
        getHeaders()
      );

      dispatch(fetchFleetVehicles(fleetId));
      dispatch(fetchFleetDrivers(fleetId));
      dispatch(fetchAssignments(fleetId));
      dispatch(fetchUnassignedVehicles(fleetId));

      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Driver assignment failed"));
    }
  }
);

// PUT /{vehicle_id}/driver — change an existing driver assignment
export const changeDriver = createAsyncThunk(
  "fleet/changeDriver",
  async ({ vehicleId, fleetId, payload }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.put(
        `${API_URL}/${vehicleId}/driver`,
        payload,
        getHeaders()
      );

      dispatch(fetchFleetVehicles(fleetId));
      dispatch(fetchFleetDrivers(fleetId));
      dispatch(fetchVehicleAssignment(vehicleId));
      dispatch(fetchUnassignedVehicles(fleetId));

      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to change driver"));
    }
  }
);

export const fetchAssignments = createAsyncThunk(
  "fleet/fetchAssignments",
  async (fleetId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/fleets/${fleetId}/assignments`, getHeaders());
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch assignments"));
    }
  }
);

export const fetchVehicleAssignment = createAsyncThunk(
  "fleet/fetchVehicleAssignment",
  async (vehicleId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/${vehicleId}/driver`, getHeaders());
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      return rejectWithValue(getErrorMsg(err, "Failed to fetch vehicle assignment"));
    }
  }
);

export const updateVehicleStatus = createAsyncThunk(
  "fleet/updateVehicleStatus",
  async ({ fleetId, vehicleId, status }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.patch(
        `${API_URL}/fleets/${fleetId}/vehicles/${vehicleId}/status`,
        { status },
        getHeaders()
      );
      dispatch(fetchFleetVehicles(fleetId));
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to update vehicle status"));
    }
  }
);

export const fetchWalletDetails = createAsyncThunk(
  "fleet/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${WALLET_API_URL}/me`, getHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch wallet"));
    }
  }
);

export const fetchWalletTransactions = createAsyncThunk(
  "fleet/fetchTransactions",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${WALLET_API_URL}/transactions?page=${page}&limit=${limit}`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch transactions"));
    }
  }
);

export const fetchPendingSettlements = createAsyncThunk(
  "fleet/fetchPendingSettlements",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/settlements/pending`, getHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch pending settlements"));
    }
  }
);

export const paySettlement = createAsyncThunk(
  "fleet/paySettlement",
  async (settlementId, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(
        `${API_URL}/settlements/${settlementId}/pay`,
        {},
        getHeaders()
      );
      dispatch(fetchPendingSettlements());
      dispatch(fetchSettlementHistory());
      dispatch(fetchWalletDetails());
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to pay settlement"));
    }
  }
);

export const fetchSettlementHistory = createAsyncThunk(
  "fleet/fetchSettlementHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/settlements/history`, getHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch settlement history"));
    }
  }
);

export const fetchSettlementTrips = createAsyncThunk(
  "fleet/fetchSettlementTrips",
  async (settlementId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/settlements/${settlementId}/trips`,
        getHeaders()
      );
      return { settlementId, trips: res.data };
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch settlement trips"));
    }
  }
);

export const fetchSettlementTransactions = createAsyncThunk(
  "fleet/fetchSettlementTransactions",
  async (settlementId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/settlements/${settlementId}/transactions`,
        getHeaders()
      );
      return { settlementId, transactions: res.data };
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Failed to fetch settlement transactions"));
    }
  }
);

const fleetSlice = createSlice({
  name: "fleet",
  initialState: {
    fleet: null,
    hasExistingFleet: null,

    vehicles: [],
    unassignedVehicles: [],       // vehicles with no active driver
    drivers: [],
    availableDrivers: [],
    assignments: [],
    availableTenants: [],

    docStatus: {
      uploaded: [],
      missing: [],
      all_uploaded: false,
      all_approved: false,
    },

    currentVehicle: null,
    vehicleDocStatus: {
      uploaded: [],
      missing: [],
      all_uploaded: false,
    },
    vehicleStep: 1,

    selectedVehicleForDocs: null,
    selectedVehicleDocStatus: null,

    selectedVehicleForManage: null,
    vehicleAssignment: null,

    wallet: null,
    transactions: [],
    transactionsPagination: {
      page: 1,
      limit: 20,
      total: 0,
    },

    pendingSettlements: [],
    settlementHistory: [],
    selectedSettlementTrips: [],
    selectedSettlementTransactions: [],

    loading: false,
    error: null,
    successMsg: null,
  },

  reducers: {
    resetVehicleStep: (state) => {
      state.currentVehicle = null;
      state.vehicleStep = 1;
      state.vehicleDocStatus = { uploaded: [], missing: [], all_uploaded: false };
    },

    clearFleetError: (state) => {
      state.error = null;
      state.successMsg = null;
    },

    setSelectedVehicleForDocs: (state, action) => {
      state.selectedVehicleForDocs = action.payload;
      state.selectedVehicleDocStatus = null;
    },

    clearSelectedVehicleForDocs: (state) => {
      state.selectedVehicleForDocs = null;
      state.selectedVehicleDocStatus = null;
    },

    clearSelectedSettlementDetails: (state) => {
      state.selectedSettlementTrips = [];
      state.selectedSettlementTransactions = [];
    },

    setSelectedVehicleForManage: (state, action) => {
      state.selectedVehicleForManage = action.payload;
      state.vehicleAssignment = null;
    },

    clearSelectedVehicleForManage: (state) => {
      state.selectedVehicleForManage = null;
      state.vehicleAssignment = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(checkFleetStatus.fulfilled, (state, action) => {
        state.fleet = action.payload;
        state.hasExistingFleet = !!action.payload;
      })
      .addCase(fetchFleetTenants.fulfilled, (state, action) => {
        state.availableTenants = action.payload || [];
      })
      .addCase(fetchDocStatus.fulfilled, (state, action) => {
        state.docStatus = action.payload;
      })
      .addCase(fetchFleetVehicles.fulfilled, (state, action) => {
        state.vehicles = action.payload || [];
      })
      .addCase(fetchUnassignedVehicles.fulfilled, (state, action) => {
        state.unassignedVehicles = action.payload || [];
      })
      .addCase(fetchFleetDrivers.fulfilled, (state, action) => {
        state.drivers = action.payload || [];
      })
      .addCase(fetchAvailableDrivers.fulfilled, (state, action) => {
        state.availableDrivers = action.payload || [];
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload || [];
      })

      .addCase(addVehicle.fulfilled, (state, action) => {
        state.currentVehicle = action.payload;
        state.vehicleStep = 2;
        state.successMsg = "Vehicle created. Upload documents to verify.";
      })

      .addCase(fetchVehicleDocStatus.fulfilled, (state, action) => {
        state.vehicleDocStatus = action.payload;
        state.selectedVehicleDocStatus = action.payload;
      })

      .addCase(applyForFleet.fulfilled, (state, action) => {
        state.fleet = action.payload;
        state.hasExistingFleet = true;
        state.successMsg = "Fleet application submitted successfully";
      })

      .addCase(addDriverToFleet.fulfilled, (state) => {
        state.successMsg = "Driver added successfully";
      })

      .addCase(assignDriverToVehicle.fulfilled, (state) => {
        state.successMsg = "Assignment confirmed";
      })

      .addCase(changeDriver.fulfilled, (state, action) => {
        state.vehicleAssignment = action.payload;
        state.successMsg = "Driver changed successfully";
      })

      .addCase(fetchVehicleAssignment.fulfilled, (state, action) => {
        state.vehicleAssignment = action.payload || null;
      })

      .addCase(updateVehicleStatus.fulfilled, (state) => {
        state.successMsg = "Vehicle status updated successfully";
      })

      .addCase(fetchWalletDetails.fulfilled, (state, action) => {
        state.wallet = action.payload;
      })

      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.transactions || [];
        state.transactionsPagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })

      .addCase(fetchPendingSettlements.fulfilled, (state, action) => {
        state.pendingSettlements = action.payload || [];
      })

      .addCase(fetchSettlementHistory.fulfilled, (state, action) => {
        state.settlementHistory = action.payload || [];
      })

      .addCase(fetchSettlementTrips.fulfilled, (state, action) => {
        state.selectedSettlementTrips = action.payload.trips || [];
      })

      .addCase(fetchSettlementTransactions.fulfilled, (state, action) => {
        state.selectedSettlementTransactions = action.payload.transactions || [];
      })

      .addCase(paySettlement.fulfilled, (state) => {
        state.successMsg = "Settlement paid successfully";
      })

      .addMatcher((action) => action.type.endsWith("/pending"), (state) => {
        state.loading = true;
        state.error = null;
        state.successMsg = null;
      })

      .addMatcher((action) => action.type.endsWith("/fulfilled"), (state) => {
        state.loading = false;
      })

      .addMatcher((action) => action.type.endsWith("/rejected"), (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const {
  resetVehicleStep,
  clearFleetError,
  setSelectedVehicleForDocs,
  clearSelectedVehicleForDocs,
  clearSelectedSettlementDetails,
  setSelectedVehicleForManage,
  clearSelectedVehicleForManage,
} = fleetSlice.actions;

export default fleetSlice.reducer;