import { createSlice } from "@reduxjs/toolkit";

export type dataType = {
    [token: string]: {
        [year: number]: {
            Date: string;
            Open: number;
            High: number;
            Low: number;
            Close: number;
            Volume: number;
        }[];
    };
};
const initialState: dataType = {};

const dataSlice = createSlice({
    name: "data",
    initialState: initialState,
    reducers: {
        fetchData(state, payload) {
            Object.assign(state, payload.payload);
        },
    },
});

export const dataActions = dataSlice.actions;
export default dataSlice.reducer;
