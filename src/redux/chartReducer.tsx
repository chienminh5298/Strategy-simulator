import { createSlice } from "@reduxjs/toolkit";

const initialState: {
    data: [];
} = {
    data: [],
};

const chartSlice = createSlice({
    name: "chart",
    initialState: initialState,
    reducers: {},
});

export const configActions = chartSlice.actions;
export default chartSlice.reducer;
