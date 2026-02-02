import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:8000";

const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

/* =========================================================
   DASHBOARD
========================================================= */

export const fetchDriverDashboardSummary = createAsyncThunk(
    "driver/dashboardSummary",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `${API}/driver/dashboard/summary`,
                authHeader()
            );
            return res.data;
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to fetch dashboard summary"
            );
        }
    }
);

/* =========================================================
   TRIP HISTORY
========================================================= */

export const fetchDriverTrips = createAsyncThunk(
    "driver/tripHistory",
    async (
        { page = 1, limit = 10, status, from_date, to_date },
        { rejectWithValue }
    ) => {
        try {
            const res = await axios.get(
                `${API}/driver/trips`,
                {
                    ...authHeader(),
                    params: {
                        page,
                        limit,
                        status,
                        from_date,
                        to_date
                    }
                }
            );
            return res.data;
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to fetch trips"
            );
        }
    }
);

/* =========================================================
   DOCUMENTS
========================================================= */

export const fetchDriverDocStatus = createAsyncThunk(
    "driver/docStatus",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `${API}/driver/documents/status`,
                authHeader()
            );
            return res.data;
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to fetch document status"
            );
        }
    }
);

export const uploadDriverDocument = createAsyncThunk(
    "driver/uploadDocument",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `${API}/driver/documents`,
                payload,
                authHeader()
            );
            return res.data;
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to upload document"
            );
        }
    }
);

/* =========================================================
   SHIFT & LOCATION
========================================================= */

export const startShift = createAsyncThunk(
    "driver/startShift",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `${API}/drivers/shifts/start`,
                payload,
                authHeader()
            );
            return res.data;
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to start shift"
            );
        }
    }
);

export const endShift = createAsyncThunk(
    "driver/endShift",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `${API}/drivers/shifts/end`,
                payload,
                authHeader()
            );
            return res.data;
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to end shift"
            );
        }
    }
);

export const fetchCurrentShift = createAsyncThunk(
    "driver/currentShift",
    async (driverId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `${API}/drivers/${driverId}/shift/current`,
                authHeader()
            );
            return res.data;
        } catch (e) {
            if (e.response?.status === 404) return null;
            return rejectWithValue("Failed to fetch current shift");
        }
    }
);

export const updateLocation = createAsyncThunk(
    "driver/updateLocation",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `${API}/drivers/location/update`,
                payload,
                authHeader()
            );
            return res.data;
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to update location"
            );
        }
    }
);

/* =========================================================
   OFFERS
========================================================= */

export const fetchOffers = createAsyncThunk(
    "driver/fetchOffers",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `${API}/driver/offers/pending`,
                authHeader()
            );
            return res.data;
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to fetch offers"
            );
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
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to respond to offer"
            );
        }
    }
);

/* =========================================================
   OTP
========================================================= */

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
            return rejectWithValue(
                e.response?.data?.detail || "Failed to generate OTP"
            );
        }
    }
);

export const getTripOtp = createAsyncThunk(
    "driver/getTripOtp",
    async (tripId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `${API}/trips/${tripId}/otp`,
                authHeader()
            );
            return res.data?.otp || null;
        } catch {
            return rejectWithValue("Failed to fetch OTP");
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
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Invalid OTP"
            );
        }
    }
);

/* =========================================================
   TRIP
========================================================= */

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
        } catch (e) {
            return rejectWithValue(
                e.response?.data?.detail || "Failed to complete trip"
            );
        }
    }
);

/* =========================================================
   SLICE
========================================================= */

const driverSlice = createSlice({
    name: "driver",

    initialState: {
        docStatus: null,
        shift: null,

        dashboardSummary: null,

        offers: [],
        selectedOffer: null,

        activeTrip: null,
        tripStatus: null,
        tripNavigation: null,

        tripHistory: {
            list: [],
            page: 1,
            limit: 10,
            total: 0
        },

        currentOtp: null,

        isPollingOffers: false,

        loading: false,
        error: null
    },

    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        /* DASHBOARD */
        clearDashboard: (state) => {
            state.dashboardSummary = null;
        },

        /* OFFERS */
        setSelectedOffer: (state, action) => {
            state.selectedOffer = action.payload;
        },
        clearSelectedOffer: (state) => {
            state.selectedOffer = null;
        },

        /* TRIP */
        setActiveTrip: (state, action) => {
            state.activeTrip = action.payload;
            state.tripStatus = action.payload?.status || null;
        },
        clearActiveTrip: (state) => {
            state.activeTrip = null;
            state.tripStatus = null;
            state.currentOtp = null;
            state.tripNavigation = null;
        },

        /* OTP */
        clearOtp: (state) => {
            state.currentOtp = null;
        },

        /* NAV */
        setTripNavigation: (state, action) => {
            state.tripNavigation = action.payload;
        },

        /* SHIFT */
        clearShift: (state) => {
            state.shift = null;
        },

        setOfferPolling: (state, action) => {
            state.isPollingOffers = action.payload;
        },

        clearTripHistory: (state) => {
            state.tripHistory = {
                list: [],
                page: 1,
                limit: 10,
                total: 0
            };
        }
    },

    extraReducers: (builder) => {
        builder

            /* DASHBOARD */
            .addCase(fetchDriverDashboardSummary.fulfilled, (state, action) => {
                state.dashboardSummary = action.payload;
            })

            /* TRIP HISTORY */
            .addCase(fetchDriverTrips.fulfilled, (state, action) => {
                state.tripHistory = {
                    list: action.payload.trips,
                    page: action.payload.page,
                    limit: action.payload.limit,
                    total: action.payload.total
                };
            })

            /* DOCUMENTS */
            .addCase(fetchDriverDocStatus.fulfilled, (state, action) => {
                state.docStatus = action.payload;
            })

            /* SHIFT */
            .addCase(startShift.fulfilled, (state, action) => {
                state.shift = action.payload;
            })
            .addCase(endShift.fulfilled, (state) => {
                state.shift = null;
            })
            .addCase(fetchCurrentShift.fulfilled, (state, action) => {
                state.shift = action.payload;
            })

            /* OFFERS */
            .addCase(fetchOffers.fulfilled, (state, action) => {
                state.offers = action.payload;
            })

            .addCase(respondOffer.fulfilled, (state, action) => {
                state.offers = state.offers.filter(
                    o => o.attempt_id !== action.payload.attemptId
                );

                if (action.payload.data?.trip) {
                    state.activeTrip = action.payload.data.trip;
                    state.tripStatus = action.payload.data.trip.status;
                }
            })

            /* OTP */
            .addCase(generateOtp.fulfilled, (state, action) => {
                state.currentOtp = action.payload.otp_code;
            })
            .addCase(getTripOtp.fulfilled, (state, action) => {
                state.currentOtp = action.payload;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.tripStatus = action.payload.status;
            })

            /* TRIP */
            .addCase(completeTrip.fulfilled, (state) => {
                state.activeTrip = null;
                state.tripStatus = null;
                state.currentOtp = null;
            });
    }
});

export const {
    clearError,
    clearDashboard,
    setSelectedOffer,
    clearSelectedOffer,
    setActiveTrip,
    clearActiveTrip,
    setTripNavigation,
    clearOtp,
    clearShift,
    setOfferPolling,
    clearTripHistory
} = driverSlice.actions;

export default driverSlice.reducer;
