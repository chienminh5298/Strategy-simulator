import { createSlice } from "@reduxjs/toolkit";

type SystemType = {
    isShowNeedHelpCustomConfig: boolean;
    isShowNeedHelpDCA: boolean;
    isLoading: boolean;
    stepCustomConfig: number;
    stepDCA: number;
    currentView: "customize" | "dca" | "recommend";
};
const initialState: SystemType = {
    isShowNeedHelpCustomConfig: false,
    isShowNeedHelpDCA: false,
    isLoading: false,
    stepCustomConfig: 0,
    stepDCA: 0,
    currentView: "dca",
};

const total_step_custom_config = 3;
const total_step_DCA = 5;

const systemSlice = createSlice({
    name: "needHelp",
    initialState: initialState,
    reducers: {
        updateStep(state, payload) {
            const { type } = payload.payload;
            if (type === "dca") {
                state.stepDCA += 1;
            } else {
                state.stepCustomConfig += 1;
            }
            if (state.stepDCA > total_step_DCA) {
                Object.assign(state, { stepDCA: 0, isShowNeedHelpDCA: false });
            }
            if (state.stepCustomConfig > total_step_custom_config) {
                Object.assign(state, { stepCustomConfig: 0, isShowNeedHelpCustomConfig: false });
            }
        },
        showNeedHelp(state, payload) {
            const { type } = payload.payload;
            if (type === "dca") {
                state.isShowNeedHelpDCA = true;
            } else {
                state.isShowNeedHelpCustomConfig = true;
            }
        },
        updateLoading(state, payload) {
            state.isLoading = payload.payload;
        },
        updateView(state, payload) {
            state.currentView = payload.payload;
        },
    },
});

export const systemActions = systemSlice.actions;
export default systemSlice.reducer;
