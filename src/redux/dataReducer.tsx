import { createSlice } from "@reduxjs/toolkit";

export type candleType = {
    Date: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
};
export type dataType = {
    [token: string]: {
        [year: number]: candleType[];
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
        updateData(state, payload) {
            const data = payload.payload;
            const token = data.token;
            state[token] = data.data.data;
        },
    },
});

export const dataActions = dataSlice.actions;
export default dataSlice.reducer;
