import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import fleetReducer from "./fleetSlice";
import driverReducer from "./driverSlice";
import riderReducer from "./riderSlice";
import fareReducer from "./fareSlice";
import tripReducer from "./tripSlice";
import locationReducer from "./locationSlice";
import adminReducer from "./adminSlice";
import tenantAdminReducer from "./tenantAdminSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer, 
    fleet: fleetReducer,
    driver: driverReducer,
    tenantAdmin: tenantAdminReducer, 

    rider: riderReducer,     
    fare: fareReducer,       
    trip: tripReducer,       
    location: locationReducer 
  },
});

export default store;
