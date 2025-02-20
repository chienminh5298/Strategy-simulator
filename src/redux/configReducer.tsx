import { configType } from "@src/component/config";
import { createSlice } from "@reduxjs/toolkit";

type ConfigRecordType = {
    profitPercent: number;
    config: configType;
};

const initialState: {
    isConfigCorrect: boolean;
    isBacktestRunning: boolean;
    bestConfig?: ConfigRecordType;
    last3Config: ConfigRecordType[];
    config: configType;
} = {
    isConfigCorrect: false,
    isBacktestRunning: false,
    last3Config: [],
    config: {
        token: "",
        year: "",
        value: 500,
        setting: {
            keepOrderOverNight: false,
            isTrigger: true,
        },
        strategy: {
            direction: "opposite",
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
                    percent: -0.7,
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
        updateRecordConfig(state, payload) {
            const { config, profitPercent }: { config: configType; profitPercent: number } = payload.payload;
            if (!state.bestConfig || state.bestConfig.profitPercent < profitPercent) {
                state.bestConfig = { profitPercent, config };
            }
            if (state.last3Config.length === 3) {
                state.last3Config.shift();
            }
            state.last3Config = [{ profitPercent, config }, ...state.last3Config];
        },
    },
});

export const configActions = configSlice.actions;
export default configSlice.reducer;
