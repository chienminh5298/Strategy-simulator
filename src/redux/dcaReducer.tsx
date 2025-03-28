import { createSlice } from "@reduxjs/toolkit";

export type DCAConfig = {
    token: string;
    year: string;
    value: number;
    totalOrder: number;
    profitPercent: number;
    isRSI: boolean;
    rsiLength: number;
    rsiDcaIn: number;
    rsiDcaOut: number;
    isConfigCorrect: boolean;
    isBacktestRunning: boolean;
};
const initialState: DCAConfig = {
    token: "",
    year: "",
    value: 100,
    totalOrder: 20,
    profitPercent: 5,
    isRSI: false,
    rsiLength: 14,
    rsiDcaIn: 35,
    rsiDcaOut: 65,
    isConfigCorrect: false,
    isBacktestRunning: false,
};

const dcaSlice = createSlice({
    name: "dca",
    initialState: initialState,
    reducers: {
        updateIsConfigCorrect(state, payload) {
            state.isConfigCorrect = payload.payload;
        },
        updateIsBacktestRunning(state, payload) {
            state.isBacktestRunning = payload.payload;
        },
        updateConfig(state, payload) {
            const { isConfigCorrect, isBacktestRunning } = state;
            return {
                ...payload.payload,
                isConfigCorrect,
                isBacktestRunning,
            };
        },
    },
});

export const dcaActions = dcaSlice.actions;
export default dcaSlice.reducer;
