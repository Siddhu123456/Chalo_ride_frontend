import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pickup: {
    lat: null,
    lng: null,
    address: '',
  },
  drop: {
    lat: null,
    lng: null,
    address: '',
  },
  currentLocation: {
    lat: null,
    lng: null,
  },
  isLoadingLocation: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setPickupLocation: (state, action) => {
      state.pickup = action.payload;
    },
    setDropLocation: (state, action) => {
      state.drop = action.payload;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setLoadingLocation: (state, action) => {
      state.isLoadingLocation = action.payload;
    },
    resetLocations: (state) => {
      state.pickup = initialState.pickup;
      state.drop = initialState.drop;
      state.isLoadingLocation = false;
      // keep currentLocation unchanged
    },
  },
});

export const {
  setPickupLocation,
  setDropLocation,
  setCurrentLocation,
  setLoadingLocation,
  resetLocations,
} = locationSlice.actions;

export default locationSlice.reducer;