import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://192.168.3.86:8000/rider";
// const API_URL = "http://localhost:8000/rider";

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


export const fetchRiderTripHistory = createAsyncThunk(
  "rider/trips/history",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/trips/history`,
        getHeaders()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        getErrorMsg(err, "Trip history fetch failed")
      );
    }
  }
);


const riderSlice = createSlice({
  name: "rider",

  initialState: {
    city: null,
    profile: null,
    statistics: null,
    tripHistory: [],     

    loadingCity: false,
    loadingProfile: false,
    loadingStatistics: false,
    loadingTripHistory: false, 

    error: null,
  },


  reducers: {},

  extraReducers: (builder) => {
    builder
      
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
      })

      
      .addCase(fetchRiderTripHistory.pending, (state) => {
        state.loadingTripHistory = true;
      })
      .addCase(fetchRiderTripHistory.fulfilled, (state, action) => {
        state.loadingTripHistory = false;
        state.tripHistory = action.payload;
      })
      .addCase(fetchRiderTripHistory.rejected, (state, action) => {
        state.loadingTripHistory = false;
        state.error = action.payload;
      });

  },
});

export default riderSlice.reducer;
