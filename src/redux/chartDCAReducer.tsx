import { OverViewType, ProfitByMonthlyChartType, StrategyBreakDownType, ValueOverTimeChartType } from "@src/utils";
import { ChartCandleType, dcaOpenOrderType, OrderType } from "@src/utils/backtestLogic";
import { createSlice } from "@reduxjs/toolkit";

type AnalyseDCAType = {
    ValueOverTimeChart: ValueOverTimeChartType[];
    overall: {
        maxOrder: number;
        maxLoss: number;
        maxProfit: number;
    };
    basket: {
        leftOrder: number;
        qty: number;
    };
};

const initialAnalyse = {
    ValueOverTimeChart: [],
    overall: {
        maxOrder: 0,
        maxLoss: 0,
        maxProfit: 0,
    },
    basket: {
        leftOrder: 0,
        qty: 0,
    },
};

const initialState: {
    data: ChartCandleType;
    analyse: AnalyseDCAType;
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
            const { data } = payload.payload;
            Object.assign(state, { ...state, data });
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

            // For analyse
            state.analyse.basket.leftOrder = Object.keys(state.openOrder).length;
            state.analyse.basket.qty = Object.values(state.openOrder).reduce((total, o) => o.qty + total, 0);
        },
        removeOpenOrder(state, payload) {
            const deleteArr = payload.payload;
            for (const order of deleteArr) {
                delete state.openOrder[order.id];
            }
            // For analyse
            state.analyse.basket.leftOrder = Object.keys(state.openOrder).length;
            state.analyse.basket.qty = Object.values(state.openOrder).reduce((total, o) => o.qty + total, 0);
        },
        updateCurrentPrice(state, payload) {
            const { currentPrice, orgBasketValue, date } = payload.payload;
            state.currentPrice = currentPrice;
            const currentBasketValue = Object.values(state.openOrder).reduce((total, o) => o.qty + total, 0) * currentPrice;
            const historyPL = state.history.reduce((total, o) => o.profit + total, 0);
            const realPL = historyPL + (currentBasketValue - orgBasketValue);
            state.analyse.ValueOverTimeChart.push({ date, value: realPL });
        },
        updateAnalyse(state, payload) {
            const { maxRealLossPL, maxRealProfitPL, maxOrder } = payload.payload;
            state.analyse.overall = { maxLoss: maxRealLossPL, maxProfit: maxRealProfitPL, maxOrder };
        },
    },
});

export const chartDCAActions = chartSlice.actions;
export default chartSlice.reducer;
