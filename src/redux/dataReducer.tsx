import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // BTC: { 2025: [{}], 2024: [{}] }
};

const dataSlice = createSlice({
    name: "data",
    initialState: initialState,
    reducers: {},
});

export const dataActions = dataSlice.actions;
export default dataSlice.reducer;
