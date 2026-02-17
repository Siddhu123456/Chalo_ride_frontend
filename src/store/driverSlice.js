import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://192.168.3.86:8000";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});


export const fetchDriverProfile = createAsyncThunk(
  "driver/profile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/driver/profile`, authHeader());
      return res.data;
    } catch {
      return rejectWithValue("Failed to fetch driver profile");
    }
  }
);


export const fetchDriverDashboardSummary = createAsyncThunk(
  "driver/dashboardSummary",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/driver/dashboard/summary`, authHeader());
      return res.data;
    } catch {
      return rejectWithValue("Failed to fetch dashboard summary");
    }
  }
);


export const fetchDriverDocStatus = createAsyncThunk(
  "driver/docStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/driver/documents/status`, authHeader());
      return res.data;
    } catch {
      return rejectWithValue("Failed to fetch document status");
    }
  }
);

export const uploadDriverDocument = createAsyncThunk(
  "driver/uploadDocument",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/driver/documents`, formData, authHeader());
      return res.data;
    } catch {
      return rejectWithValue("Failed to upload document");
    }
  }
);


export const fetchCurrentShift = createAsyncThunk(
  "driver/currentShift",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/drivers/shift/current`, authHeader());
      return res.data;
    } catch (e) {
      if (e.response?.status === 404 || e.response?.status === 422) {
        return null;
      }
      return rejectWithValue("Failed to fetch current shift");
    }
  }
);

export const startShift = createAsyncThunk(
  "driver/startShift",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/drivers/shifts/start`, payload, authHeader());
      return res.data;
    } catch {
      return rejectWithValue("Failed to start shift");
    }
  }
);

export const endShift = createAsyncThunk(
  "driver/endShift",
  async (payload, { rejectWithValue }) => {
    try {
      await axios.post(`${API}/drivers/shifts/end`, payload, authHeader());
      return true;
    } catch {
      return rejectWithValue("Failed to end shift");
    }
  }
);


export const updateDriverLocation = createAsyncThunk(
  "driver/updateLocation",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API}/drivers/location/update`,
        payload,
        authHeader()
      );
      return res.data;
    } catch {
      return rejectWithValue("Failed to update location");
    }
  }
);


export const fetchDriverTrips = createAsyncThunk(
  "driver/tripHistory",
  async ({ page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API}/driver/trips/trips`,
        {
          ...authHeader(),
          params: { page, limit }
        }
      );
      return res.data;
    } catch {
      return rejectWithValue("Failed to fetch driver trips");
    }
  }
);


export const fetchCurrentVehicleAssignment = createAsyncThunk(
  "driver/currentVehicleAssignment",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API}/driver/vehicle/assignment/current`,
        authHeader()
      );
      return res.data;
    } catch (e) {
      if (e.response?.status === 404) return null;
      return rejectWithValue("Failed to fetch vehicle assignment");
    }
  }
);


export const fetchOffers = createAsyncThunk(
  "driver/fetchOffers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/driver/offers/pending`, authHeader());
      return res.data;
    } catch {
      return rejectWithValue("Failed to fetch offers");
    }
  }
);

export const respondOffer = createAsyncThunk(
  "driver/respondOffer",
  async ({ attemptId, accept }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API}/driver/offers/${attemptId}/respond`,
        { accept },
        authHeader()
      );
      return { attemptId, data: res.data };
    } catch {
      return rejectWithValue("Failed to respond to offer");
    }
  }
);



export const generateOtp = createAsyncThunk(
  "driver/generateOtp",
  async (tripId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API}/trips/${tripId}/otp/generate`,
        {},
        authHeader()
      );
      return res.data; 
    } catch (e) {
      return rejectWithValue("Failed to generate OTP");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "driver/verifyOtp",
  async ({ tripId, otp_code }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API}/trips/${tripId}/otp/verify`,
        { otp_code },
        authHeader()
      );
      return res.data; 
    } catch {
      return rejectWithValue("Invalid OTP");
    }
  }
);


export const completeTrip = createAsyncThunk(
  "driver/completeTrip",
  async (tripId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API}/trips/${tripId}/complete`,
        {},
        authHeader()
      );
      return res.data; 
    } catch {
      return rejectWithValue("Failed to complete trip");
    }
  }
);



const driverSlice = createSlice({
  name: "driver",

  initialState: {
    profile: null,
    isApproved: false,

    docStatus: null,
    dashboardSummary: null,

    shift: null,

    offers: [],
    activeTrip: null,
    tripStatus: null,

    tripHistory: {
      list: [],
      page: 1,
      limit: 5,
      total: 0
    },

    vehicleAssignment: null,

    loading: false,
    error: null
  },

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearActiveTrip: (state) => {
      state.activeTrip = null;
      state.tripStatus = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isApproved = action.payload.approval_status === "APPROVED";
      })

      .addCase(fetchDriverDocStatus.fulfilled, (state, action) => {
        state.docStatus = action.payload;
      })

      .addCase(fetchDriverDashboardSummary.fulfilled, (state, action) => {
        state.dashboardSummary = action.payload;
      })

      .addCase(fetchCurrentShift.fulfilled, (state, action) => {
        state.shift = action.payload;
      })
      .addCase(startShift.fulfilled, (state, action) => {
        state.shift = action.payload;
      })
      .addCase(endShift.fulfilled, (state) => {
        state.shift = null;
      })

      .addCase(fetchDriverTrips.fulfilled, (state, action) => {
        state.tripHistory = {
          list: action.payload.trips,
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total
        };
      })

      .addCase(fetchCurrentVehicleAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentVehicleAssignment.fulfilled, (state, action) => {
        state.vehicleAssignment = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentVehicleAssignment.rejected, (state) => {
        state.vehicleAssignment = null;
        state.loading = false;
      })

      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offers = action.payload;
      })
      .addCase(respondOffer.fulfilled, (state, action) => {
        state.offers = state.offers.filter(
          (o) => o.attempt_id !== action.payload.attemptId
        );

        if (action.payload.data?.trip) {
          state.activeTrip = action.payload.data.trip;
          state.tripStatus = action.payload.data.trip.status;
        }
      })

      .addCase(generateOtp.fulfilled, (state, action) => {
        state.currentOtp = action.payload.otp_code;
      })

      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.tripStatus = action.payload.status;
      })

      .addCase(completeTrip.fulfilled, (state, action) => {
        state.activeTrip = null;
        state.tripStatus = null;
        state.currentOtp = null;
      });

  }
});

export const { clearError, clearActiveTrip } = driverSlice.actions;
export default driverSlice.reducer;
