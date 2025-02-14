import { createSlice } from "@reduxjs/toolkit";
import { ChartCandleType } from "@src/utils/backtestLogic";

const initialState: {
    data: ChartCandleType;
    duration: number;
} = {
    data: {},
    duration: 5,
};

const chartSlice = createSlice({
    name: "chart",
    initialState: initialState,
    reducers: {
        updateData(state, payload) {
            Object.assign(state.data, payload.payload);
        },
        resetState(state, payload) {
            state.data = {};
        },
    },
});

export const chartActions = chartSlice.actions;
export default chartSlice.reducer;
