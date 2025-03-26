import { createSlice } from "@reduxjs/toolkit";

type SystemType = {
    isShowNeedHelp: boolean;
    isLoading: boolean;
    step: number;
};
const initialState: SystemType = {
    isShowNeedHelp: false,
    isLoading: false,
    step: 0,
};

const total_step = 3;

const systemSlice = createSlice({
    name: "needHelp",
    initialState: initialState,
    reducers: {
        updateStep(state, payload) {
            state.step += 1;
            if (state.step > total_step) {
                Object.assign(state, { step: 0, isShowNeedHelp: false });
            }
        },
        showNeedHelp(state, payload) {
            state.isShowNeedHelp = true;
        },
        updateLoading(state, payload) {
            state.isLoading = payload.payload;
        }
    },
});

export const systemActions = systemSlice.actions;
export default systemSlice.reducer;
