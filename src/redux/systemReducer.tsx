import { createSlice } from "@reduxjs/toolkit";

type SystemType = {
    isShowNeedHelpCustomConfig: boolean;
    isLoading: boolean;
    stepCustomConfig: number;
};
const initialState: SystemType = {
    isShowNeedHelpCustomConfig: false,
    isLoading: false,
    stepCustomConfig: 0,
};

const total_step_custom_config = 3;

const systemSlice = createSlice({
    name: "needHelp",
    initialState: initialState,
    reducers: {
        updateStepCustomConfig(state, payload) {
            state.stepCustomConfig += 1;
            if (state.stepCustomConfig > total_step_custom_config) {
                Object.assign(state, { step: 0, isShowNeedHelpCustomConfig: false });
            }
        },
        showNeedHelp(state, payload) {
            state.isShowNeedHelpCustomConfig = true;
        },
        updateLoading(state, payload) {
            state.isLoading = payload.payload;
        }
    },
});

export const systemActions = systemSlice.actions;
export default systemSlice.reducer;
