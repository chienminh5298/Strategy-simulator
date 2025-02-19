import { createSlice } from "@reduxjs/toolkit";

type NeedHelpType = {
    isShowNeedHelp: boolean;
    step: number;
};
const initialState: NeedHelpType = {
    isShowNeedHelp: false,
    step: 0,
};

const total_step = 3;

const needHelpSlice = createSlice({
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
    },
});

export const needHelpActions = needHelpSlice.actions;
export default needHelpSlice.reducer;
