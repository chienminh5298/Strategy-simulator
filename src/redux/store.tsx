import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "@src/redux/dataReducer";
import configReducer from "@src/redux/configReducer";
import chartReducer from "@src/redux/chartReducer";

const store = configureStore({
    reducer: {
        config: configReducer, // Add reducers here
        data: dataReducer, // Add reducers here
        chart: chartReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // ⚠️ Disables serialization check (Not recommended)
        }),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
