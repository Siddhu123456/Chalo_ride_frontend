import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8000/trips";

/* -----------------------------------------
   Helpers
------------------------------------------ */
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

const getErrorMsg = (err, fallback = "Something went wrong") => {
  const data = err?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  return err?.message || fallback;
};

/* -----------------------------------------
   ASYNC
------------------------------------------ */
export const fetchFareEstimates = createAsyncThunk(
  "fare/fetchEstimates",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/fare-estimate`,
        payload,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err));
    }
  }
);

/* -----------------------------------------
   SLICE
------------------------------------------ */
const fareSlice = createSlice({
  name: "fare",
  initialState: {
    cityId: null,
    pickupAddress: "",
    dropAddress: "",
    distanceKm: 0,

    vehicleCategory: "CAB",
    estimates: [],
    selectedRide: null,

    loading: false,
    error: null,
  },

  reducers: {
    setVehicleCategory: (state, action) => {
      state.vehicleCategory = action.payload;
    },

    selectRide: (state, action) => {
      state.selectedRide = action.payload;
    },

    resetFareState: () => ({
      cityId: null,
      pickupAddress: "",
      dropAddress: "",
      distanceKm: 0,
      vehicleCategory: "CAB",
      estimates: [],
      selectedRide: null,
      loading: false,
      error: null,
    }),
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchFareEstimates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchFareEstimates.fulfilled, (state, action) => {
        state.loading = false;

        state.cityId = action.payload.city_id;
        state.pickupAddress = action.payload.pickup_address;
        state.dropAddress = action.payload.drop_address;
        state.distanceKm = action.payload.distance_km;

        // 🔥 normalize for FareDiscovery UI
        state.estimates = (action.payload.estimates || [])
          .filter(e => e.available_drivers > 0)
          .map((e, idx) => ({
            id: idx + 1,
            tenant_id: e.tenant_id,
            name: e.tenant_name,
            vehicle_category: e.vehicle_category,
            price: e.fare,
            available: `${e.available_drivers} drivers nearby`,
            breakup: e.breakup,
          }))
          .sort((a, b) => a.price - b.price);
      })

      .addCase(fetchFareEstimates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setVehicleCategory,
  selectRide,
  resetFareState,
} = fareSlice.actions;

export default fareSlice.reducer;
