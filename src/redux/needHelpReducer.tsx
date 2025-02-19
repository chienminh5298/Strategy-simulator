import { createSlice } from "@reduxjs/toolkit";

type NeedHelpType = {
    isShowNeedHelp: boolean;
    step: number;
};
const initialState: NeedHelpType = {
    isShowNeedHelp: true,
    step: 0,
};

const needHelpSlice = createSlice({
    name: "needHelp",
    initialState: initialState,
    reducers: {},
});

export const needHelpActions = needHelpSlice.actions;
export default needHelpSlice.reducer;
