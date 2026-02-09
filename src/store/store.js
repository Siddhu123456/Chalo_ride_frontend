import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import fleetReducer from "./fleetSlice";
import driverReducer from "./driverSlice";
import riderReducer from "./riderSlice";
import fareReducer from "./fareSlice";
import tripReducer from "./tripSlice";
import locationReducer from "./locationSlice";
import adminReducer from "./adminSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer, 
    fleet: fleetReducer,
    driver: driverReducer,

    rider: riderReducer,     // navbar, profile, stats
    fare: fareReducer,       // fare discovery
    trip: tripReducer,       // booking, otp, tracking
    location: locationReducer // pickup / drop (UI)
  },
});

export default store;
