import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "@src/redux/dataReducer";

const store = configureStore({
    reducer: {
        // config: configReducer, // Add reducers here
        data: dataReducer, // Add reducers here
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
