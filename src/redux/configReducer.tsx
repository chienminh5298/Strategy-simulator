import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: undefined,
    year: undefined,
    value: 500,
    prevCandle: "red",
    strategy: {
        side: "long",
        stoplosses: [
            {
                target: 0,
                percent: -2,
            },
            {
                target: 0.7,
                percent: 0.7,
            },
        ],
    },
    triggerStrategy: {
        side: "short",
        stoplosses: [
            {
                target: 0,
                percent: -2,
            },
            {
                target: 0.7,
                percent: 0.7,
            },
        ],
    },
};

const configSlice = createSlice({
    name: "config",
    initialState: initialState,
    reducers: {},
});

export const configActions = configSlice.actions;
export default configSlice.reducer;
