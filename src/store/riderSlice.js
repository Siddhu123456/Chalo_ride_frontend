import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8000/rider";

/* -----------------------------------------
   Helpers
------------------------------------------ */
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getErrorMsg = (err, fallback = "Something went wrong") => {
  const data = err?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  return err?.message || fallback;
};

/* -----------------------------------------
   ASYNC THUNKS
------------------------------------------ */

// 📍 Detect rider city
export const fetchRiderCity = createAsyncThunk(
  "rider/fetchCity",
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/city?lat=${lat}&lng=${lng}`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "City detection failed"));
    }
  }
);

// 👤 Rider profile
export const fetchRiderProfile = createAsyncThunk(
  "rider/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/profile`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Profile fetch failed"));
    }
  }
);

// 📊 Rider statistics
export const fetchRiderStatistics = createAsyncThunk(
  "rider/fetchStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/statistics`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMsg(err, "Statistics fetch failed"));
    }
  }
);

/* -----------------------------------------
   SLICE
------------------------------------------ */
const riderSlice = createSlice({
  name: "rider",

  initialState: {
    city: null,
    profile: null,
    statistics: null,

    loadingCity: false,
    loadingProfile: false,
    loadingStatistics: false,

    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // ───────── City ─────────
      .addCase(fetchRiderCity.pending, (state) => {
        state.loadingCity = true;
      })
      .addCase(fetchRiderCity.fulfilled, (state, action) => {
        state.loadingCity = false;
        state.city = action.payload;
      })
      .addCase(fetchRiderCity.rejected, (state, action) => {
        state.loadingCity = false;
        state.error = action.payload;
      })

      // ───────── Profile ─────────
      .addCase(fetchRiderProfile.pending, (state) => {
        state.loadingProfile = true;
      })
      .addCase(fetchRiderProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.profile = action.payload;
      })
      .addCase(fetchRiderProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        state.error = action.payload;
      })

      // ───────── Statistics ─────────
      .addCase(fetchRiderStatistics.pending, (state) => {
        state.loadingStatistics = true;
      })
      .addCase(fetchRiderStatistics.fulfilled, (state, action) => {
        state.loadingStatistics = false;
        state.statistics = action.payload;
      })
      .addCase(fetchRiderStatistics.rejected, (state, action) => {
        state.loadingStatistics = false;
        state.error = action.payload;
      });
  },
});

export default riderSlice.reducer;
