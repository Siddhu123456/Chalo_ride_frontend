import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import fleetReducer from "./fleetSlice";
import driverReducer from "./driverSlice";
import DriverDocsPage from "../features/driver/pages/DriverDocsPage";

const store = configureStore({
  reducer: {
    auth: authReducer,
    fleet: fleetReducer,
    driver: driverReducer,
  },
});

export default store;