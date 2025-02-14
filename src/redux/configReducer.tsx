import { createSlice } from "@reduxjs/toolkit";
import { configType } from "@src/component/config";

const initialState: {
    isConfigCorrect: boolean;
    isBacktestRunning: boolean;
    config: configType;
} = {
    isConfigCorrect: false,
    isBacktestRunning: false,
    config: {
        token: "",
        year: "",
        value: 500,
        setting: {
            keepOrderOverNight: false,
            isTrigger: false,
        },
        strategy: {
            direction: "opposite",
            // stoplosses: [
            //     {
            //         target: 0,
            //         percent: -5,
            //     },
            //     {
            //         target: 1,
            //         percent: 0,
            //     },
            //     {
            //         target: 2,
            //         percent: 1,
            //     },
            //     {
            //         target: 3,
            //         percent: 2,
            //     },
            //     {
            //         target: 4,
            //         percent: 3,
            //     },
            //     {
            //         target: 5,
            //         percent: 5,
            //     },
            // ],
            stoplosses: [
                {
                    target: 0,
                    percent: -0.7,
                },
                {
                    target: 0.7,
                    percent: 0.7,
                },
            ],
        },
        triggerStrategy: {
            direction: "opposite",
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
    },
};

const configSlice = createSlice({
    name: "config",
    initialState: initialState,
    reducers: {
        updateIsConfigCorrect(state, payload) {
            state.isConfigCorrect = payload.payload;
        },
        updateIsBacktestRunning(state, payload) {
            state.isBacktestRunning = payload.payload;
        },
        updateConfig(state, payload) {
            Object.assign(state.config, payload.payload);
        },
    },
});

export const configActions = configSlice.actions;
export default configSlice.reducer;
