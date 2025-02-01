import { configureStore } from "@reduxjs/toolkit";
import configReducer from "./configReducer";

const store = configureStore({
    reducer: {
        config: configReducer, // Add reducers here
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;