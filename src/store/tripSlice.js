import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_URL = "http://192.168.3.86:8000/trips";
const API_URL = "http://localhost:8000/trips";

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

export const requestTrip = createAsyncThunk(
  "trip/request",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/request`, payload, getHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err));
    }
  }
);

export const fetchTripStatus = createAsyncThunk(
  "trip/status",
  async (tripId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/${tripId}`, getHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err));
    }
  }
);

export const fetchTripOtp = createAsyncThunk(
  "trip/otp",
  async (tripId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/${tripId}/otp`, getHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err));
    }
  }
);

export const cancelTrip = createAsyncThunk(
  "trip/cancel",
  async ({ tripId, reason }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/${tripId}/cancel`,
        { reason },
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err));
    }
  }
);

export const rateTrip = createAsyncThunk(
  "trip/rate",
  async ({ tripId, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/${tripId}/rate`,
        { rating, comment },
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err));
    }
  }
);

const tripSlice = createSlice({
  name: "trip",
  initialState: {
    tripId: null,
    status: null,
    otp: null,
    fareAmount: null,
    requesting: false,
    loading: false,
    cancelling: false,
    rating: null,
    ratingSubmitted: false,
    ratingLoading: false,
    ratingError: null,
    error: null,
  },
  reducers: {
    resetTripState: () => ({
      tripId: null,
      status: null,
      driver: null,
      vehicle: null,
      otp: null,
      fareAmount: null,
      requesting: false,
      loading: false,
      cancelling: false,
      rating: null,
      ratingSubmitted: false,
      ratingLoading: false,
      ratingError: null,
      error: null,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestTrip.pending, (state) => {
        state.requesting = true;
        state.error = null;
      })
      .addCase(requestTrip.fulfilled, (state, action) => {
        state.requesting = false;
        state.tripId = action.payload.trip_id;
        state.status = action.payload.status;
        state.fareAmount = action.payload.fare_amount;
      })
      .addCase(requestTrip.rejected, (state, action) => {
        state.requesting = false;
        state.error = action.payload;
      })
      .addCase(fetchTripStatus.fulfilled, (state, action) => {
        state.status = action.payload.status;
      })
      .addCase(fetchTripOtp.fulfilled, (state, action) => {
        state.otp = action.payload;
      })
      .addCase(cancelTrip.pending, (state) => {
        state.cancelling = true;
      })
      .addCase(cancelTrip.fulfilled, (state) => {
        state.cancelling = false;
        state.status = "CANCELLED";
      })
      .addCase(cancelTrip.rejected, (state, action) => {
        state.cancelling = false;
        state.error = action.payload;
      })
      .addCase(rateTrip.pending, (state) => {
        state.ratingLoading = true;
        state.ratingError = null;
      })
      .addCase(rateTrip.fulfilled, (state, action) => {
        state.ratingLoading = false;
        state.rating = action.payload;
        state.ratingSubmitted = true;
      })
      .addCase(rateTrip.rejected, (state, action) => {
        state.ratingLoading = false;
        state.ratingError = action.payload;
      });
  },
});

export const { resetTripState } = tripSlice.actions;
export default tripSlice.reducer;