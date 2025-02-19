import { OverViewType, processDataForAnalyse, ProfitByMonthlyChartType, StrategyBreakDownType, ValueOverTimeChartType } from "@src/utils";
import { ChartCandleType, OrderType } from "@src/utils/backtestLogic";
import { createSlice } from "@reduxjs/toolkit";

const initialAnalyse = {
    profitByMonthlyChart: [],
    ValueOverTimeChart: [],
    overView: {
        totalPnL: 0,
        winRate: 0,
        lossRate: 0,
        totalTrade: 0,
        averangeProfit: 0,
        averangeLoss: 0,
        longOrder: 0,
        longProfit: 0,
        longLoss: 0,
        shortOrder: 0,
        shortProfit: 0,
        shortLoss: 0,
    },
    strategyBreakDown: {
        totalPnL: 0,
        winRate: 0,
        lossRate: 0,
        longOrder: 0,
        longProfit: 0,
        longLoss: 0,
        shortOrder: 0,
        shortProfit: 0,
        shortLoss: 0,
        targetHit: {},
    },
    triggerStrategyBreakDown: {
        totalPnL: 0,
        winRate: 0,
        lossRate: 0,
        longOrder: 0,
        longProfit: 0,
        longLoss: 0,
        shortOrder: 0,
        shortProfit: 0,
        shortLoss: 0,
        targetHit: {},
    },
};

const initialState: {
    data: ChartCandleType;
    analyse: {
        overView: OverViewType;
        ValueOverTimeChart: ValueOverTimeChartType[];
        profitByMonthlyChart: ProfitByMonthlyChartType[];
        strategyBreakDown: StrategyBreakDownType;
        triggerStrategyBreakDown: StrategyBreakDownType;
    };
    history: Required<OrderType>[];
    duration: number;
} = {
    data: {},
    analyse: initialAnalyse,
    history: [],
    duration: 2.5,
};

const chartSlice = createSlice({
    name: "chart",
    initialState: initialState,
    reducers: {
        updateData(state, payload) {
            Object.assign(state.data, payload.payload.data);
            Object.assign(state.analyse, processDataForAnalyse(payload.payload.analyse));
        },
        resetState(state, payload) {
            state.data = {};
            state.analyse = initialAnalyse;
            state.history = [];
        },
        updateHistory(state, payload) {
            Object.assign(state.history, [payload.payload, ...state.history]);
        },
    },
});

export const chartActions = chartSlice.actions;
export default chartSlice.reducer;
