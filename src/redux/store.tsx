import configReducer from "@src/redux/configReducer";
import chartConfigReducer from "@src/redux/chartConfigReducer";
import chartDCAReducer from "@src/redux/chartDCAReducer";
import systemReducer from "@src/redux/systemReducer";
import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "@src/redux/dataReducer";
import dcaReducer from "@src/redux/dcaReducer";

const store = configureStore({
    reducer: {
        config: configReducer, // Add reducers here
        dca: dcaReducer, // Add reducers here
        data: dataReducer, // Add reducers here
        chartConfig: chartConfigReducer,
        chartDCA: chartDCAReducer,
        system: systemReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // ⚠️ Disables serialization check (Not recommended)
        }),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
