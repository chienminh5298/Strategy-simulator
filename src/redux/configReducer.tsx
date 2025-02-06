import { createSlice } from "@reduxjs/toolkit";

const initialState: {
    isConfigCorrect: boolean;
} = {
    isConfigCorrect: true,
};

const configSlice = createSlice({
    name: "config",
    initialState: initialState,
    reducers: {
        updateConfig(state, payload) {
            state.isConfigCorrect = payload.payload;
        },
    },
});

export const configActions = configSlice.actions;
export default configSlice.reducer;
