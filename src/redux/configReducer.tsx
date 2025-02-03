import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    formError: undefined as undefined | "token" | "year" | "value" | "strategy" | "triggerStrategy",
    isTrigger: true,
    form: {
        token: "",
        year: "",
        value: 500,
        prevCandle: "red",
        strategy: {
            side: "long",
            stoplosses: [
                {
                    target: 0,
                    percent: -2,
                },
                {
                    target: 0.7,
                    percent: 0.7,
                },
            ],
        },
        triggerStrategy: {
            side: "short",
            stoplosses: [
                {
                    target: 0,
                    percent: -2,
                },
                {
                    target: 0.7,
                    percent: 0.7,
                },
            ],
        },
    },
};

const configSlice = createSlice({
    name: "config",
    initialState: initialState,
    reducers: {
        applyConfig: (state, payload) => {
            const newConfig = payload.payload;
            const checkNewConfig = checkConfig(newConfig, state.isTrigger);
            if (checkNewConfig === undefined) {
                // Check passed
                Object.assign(state.form, payload.payload);
                state.formError = undefined;
            } else {
                state.formError = checkNewConfig;
            }
        },
        setTrigger: (state, payload) => {
            state.isTrigger = payload.payload;
        },
    },
});

export const configActions = configSlice.actions;
export default configSlice.reducer;

const checkConfig = (config: typeof initialState.form, isTrigger: boolean) => {
    if (config.token === "") return "token";
    if (config.year === "") return "year";
    if (config.value < 500) return "value";
    // Check strategy
    const checkStrategy = checkStrategyFn(config.strategy.stoplosses);
    if (checkStrategy !== undefined) return checkStrategy;
    // Check trigger strategy
    if (isTrigger) {
        const checkTriggerStrategy = checkStrategyFn(config.triggerStrategy.stoplosses);
        if (checkTriggerStrategy !== undefined) return "triggerStrategy";
    }
};

const checkStrategyFn = (stoplosses: typeof initialState.form.strategy.stoplosses) => {
    // Check strategy has at lease 2 stoplosses
    if (stoplosses.length < 2) return "strategy";
    // Check each stoploss
    for (const stoploss of stoplosses) {
        if (stoploss.percent > stoploss.target) return "strategy";
    }
    // Check first stoploss target === 0
    if (stoplosses[0].target !== 0) return "strategy";
    // Check last stoploss percent should === target to close order
    const lastStoploss = stoplosses[stoplosses.length - 1];
    if (lastStoploss.percent !== lastStoploss.target) return "strategy";
};
