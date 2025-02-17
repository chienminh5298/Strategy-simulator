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
        [year: number]: {
            [date: string]: candleType;
        };
    };
};
const initialState: dataType = {};

const dataSlice = createSlice({
    name: "data",
    initialState: initialState,
    reducers: {
        fetchToken(state, payload) {
            Object.assign(state, payload.payload);
        },

        updateYearData(state, payload) {
            const data = payload.payload;
            const token = data.token;
            const year = data.year === "" ? new Date().getFullYear() : data.year;
            Object.assign(state[token][year], data.data.data);
        },
    },
});

export const dataActions = dataSlice.actions;
export default dataSlice.reducer;
