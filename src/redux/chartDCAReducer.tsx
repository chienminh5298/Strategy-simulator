import { OverViewType, ProfitByMonthlyChartType, StrategyBreakDownType, ValueOverTimeChartType } from "@src/utils";
import { ChartCandleType, dcaOpenOrderType, OrderType } from "@src/utils/backtestLogic";
import { createSlice } from "@reduxjs/toolkit";

const initialAnalyse = {
    profitByMonthlyChart: [],
    ValueOverTimeChart: [],
};

const initialState: {
    data: ChartCandleType;
    analyse: {
        ValueOverTimeChart: ValueOverTimeChartType[];
        profitByMonthlyChart: ProfitByMonthlyChartType[];
    };
    history: Required<OrderType>[];
    openOrder: {
        [orderId: number]: dcaOpenOrderType;
    };
    duration: number;
    currentPrice: number;
} = {
    data: {},
    analyse: initialAnalyse,
    history: [],
    openOrder: {},
    duration: 5,
    currentPrice: 0,
};

const chartSlice = createSlice({
    name: "chartDCA",
    initialState: initialState,
    reducers: {
        updateData(state, payload) {
            const { data, analyse } = payload.payload;
            Object.assign(state, { ...state, data, analyse });
        },
        resetState(state, payload) {
            state.data = {};
            state.analyse = initialAnalyse;
            state.history = [];
            state.openOrder = {};
        },
        updateHistory(state, payload) {
            Object.assign(state.history, [...payload.payload, ...state.history]);
        },
        addOpenOrder(state, payload) {
            const newOrder = payload.payload;
            state.openOrder[newOrder.id] = newOrder;
        },
        removeOpenOrder(state, payload) {
            const deleteArr = payload.payload;
            for (const order of deleteArr) {
                delete state.openOrder[order.id];
            }
        },
        updateCurrentPrice(state, payload) {
            state.currentPrice = payload.payload;
        },
    },
});

export const chartDCAActions = chartSlice.actions;
export default chartSlice.reducer;
