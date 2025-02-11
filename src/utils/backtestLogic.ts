import { configType, StoplossType } from "@src/component/config";
import { candleType } from "@src/redux/dataReducer";

type OrderType = {
    id: number;
    entryTime: string;
    executedTime?: string; // Optional
    isTrigger: boolean;
    entryPrice: number;
    markPrice?: number; // Optional
    side: "long" | "short";
    qty: number;
    profit?: number; // Optional
    stoplossIdx: number;
};

export type ChartCandleType = {
    [date: string]: {
        candle: candleType;
        executedOrder?: Required<OrderType>;
        openOrderSide?: "long" | "short";
    };
};

export const backtestLogic = (data: candleType[], config: configType) => {
    let openOrder: { [orderId: number]: OrderType } = {};
    let response: ChartCandleType = {};

    const processCreateNewMidNightOrder = (data: candleType[], config: configType, candle: candleType, i: number) => {
        const prevDayOpenCandle = data[i - 240];
        const prevDayCloseCandle = data[i - 1];
        const side = getNewOrderSide({ config, isTriggerOrder: false, openCandle: prevDayOpenCandle, closeCandle: prevDayCloseCandle });
        createNewOrder({ candle, entryPrice: candle.Open, isTrigger: false, side, config });
    };

    const checkIsMidNight = (UTCstring: string) => {
        const date = new Date(UTCstring);
        return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
    };

    const checkHitTarget = (candle: candleType, config: configType) => {
        for (const orderId in openOrder) {
            const order = openOrder[orderId];

            const stoploss: StoplossType[] = order.isTrigger ? config.triggerStrategy.stoplosses : config.strategy.stoplosses;

            // Check is last target
            if (order.stoplossIdx === stoploss.length - 1) {
                //// Close order
                // Check strategy or triggerStrategy
                if (!order.isTrigger) {
                    const markPrice = getMarkPRice(stoploss[order.stoplossIdx].target, order.side, order.entryPrice);
                    if (config.setting.isTrigger) {
                        // new trigger order
                        const side = getTriggerOrderSide(order, config);
                        createNewOrder({ candle, entryPrice: markPrice, config, isTrigger: true, side });
                    } else {
                        closeOrder(order, markPrice, candle);
                    }
                } else {
                    const markPrice = getMarkPRice(stoploss[order.stoplossIdx].target, order.side, order.entryPrice);
                    closeOrder(order, markPrice, candle);
                }
            } else {
                // Move stoploss by update stoplossIdx
                openOrder[order.id] = { ...openOrder[order.id], stoplossIdx: openOrder[order.id].stoplossIdx + 1 };
            }
        }
    };

    const getTriggerOrderSide = (strategyOrder: OrderType, config: configType) => {
        if (config.triggerStrategy.direction === "same") return strategyOrder.side;
        else return strategyOrder.side === "long" ? "short" : "long";
    };

    const checkHitStoploss = (candle: candleType, config: configType) => {
        for (const id in openOrder) {
            const order = openOrder[id];
            const stoploss: StoplossType[] = order.isTrigger ? config.triggerStrategy.stoplosses : config.strategy.stoplosses;
            const markPrice = getMarkPRice(stoploss[order.stoplossIdx].percent, order.side, order.entryPrice);

            if ((order.side === "long" && candle.Low <= markPrice) || (order.side === "short" && candle.Low >= markPrice)) {
                // close order
                closeOrder(order, markPrice, candle);
            }
        }
    };

    const getProfit = ({ qty, side, markPrice, entryPrice }: { qty: number; side: "long" | "short"; markPrice: number; entryPrice: number }) => {
        if (side === "long") {
            return (markPrice - entryPrice) * qty;
        } else {
            return (entryPrice - markPrice) * qty;
        }
    };

    const getDayColor = (openCandle: candleType, closeCandle: candleType) => {
        if (openCandle.Open > closeCandle.Close) return "red";
        else return "green";
    };

    type GetNewOrderSideType = {
        config: configType;
        isTriggerOrder: boolean;
        openCandle: candleType;
        closeCandle: candleType;
    };

    const getNewOrderSide = ({ config, isTriggerOrder, openCandle, closeCandle }: GetNewOrderSideType) => {
        const prevDayCandleColor = getDayColor(openCandle, closeCandle);

        if (!isTriggerOrder) {
            if (config.strategy.direction === "same") return prevDayCandleColor === "green" ? "long" : "short";
            else return prevDayCandleColor === "green" ? "short" : "long";
        } else {
            if ((config.strategy.direction === "same" && config.triggerStrategy.direction === "same") || (config.strategy.direction === "opposite" && config.triggerStrategy.direction === "opposite")) return prevDayCandleColor === "green" ? "long" : "short";
            else return prevDayCandleColor === "green" ? "short" : "long";
        }
    };

    type CreateNewOrderType = {
        candle: candleType;
        entryPrice: number;
        config: configType;
        isTrigger: boolean;
        side: "long" | "short";
    };

    const createNewOrder = ({ candle, entryPrice, config, isTrigger, side }: CreateNewOrderType) => {
        const orderId = randomId();
        openOrder[orderId] = {
            id: orderId,
            entryTime: candle.Date,
            entryPrice,
            qty: config.value / entryPrice,
            isTrigger,
            side,
            stoplossIdx: 0,
        };

        response[candle.Date] = { ...response[candle.Date], openOrderSide: side }; // This is not a part of logic
    };

    const closeOrder = (order: OrderType, markPrice: number, candle: candleType) => {
        if (openOrder[order.id]) {
            const profit = getProfit({ qty: order.qty, side: order.side, markPrice, entryPrice: order.entryPrice });
            const tempOrder = { ...openOrder[order.id], markPrice, executedTime: candle.Date, profit };
            delete openOrder[order.id];

            response[candle.Date] = { ...response[candle.Date], executedOrder: tempOrder }; // This is not a part of logic
        }
    };

    const getMarkPRice = (percent: number, side: "long" | "short", entryPrice: number) => {
        if (side === "long") {
            return entryPrice - (percent * entryPrice) / 100;
        } else {
            return entryPrice + (percent * entryPrice) / 100;
        }
    };

    const randomId = () => Math.floor(100000000 + Math.random() * 900000000);

    //========================= Logic start from here ========================= //

    for (let i = 481; i < data.length; i++) {
        const candle = data[i];
        response[candle.Date] = { candle }; // This is not a part of logic

        checkHitStoploss(candle, config);
        checkHitTarget(candle, config);

        if (checkIsMidNight(candle.Date)) {
            // Check if exsist open order
            if (Object.keys(openOrder).length > 0) {
                // Check setting is order not keep over night
                if (!config.setting.keepOrderOverNight) {
                    // Close all order
                    for (const orderId in openOrder) {
                        const order = openOrder[orderId];
                        const markPrice = candle.Open; // We close order at mid night => markPrice is open price
                        closeOrder(order, markPrice, candle);
                    }

                    // Create new order
                    processCreateNewMidNightOrder(data, config, candle, i);

                    // Check hit stoploss for new oder just opned (In case hit stoploss at first candle of the day)
                    checkHitStoploss(candle, config);
                    checkHitTarget(candle, config);
                } else {
                    // If order keep over night => Do nothing, let order keep running
                }
            } else {
                // Create new order
                processCreateNewMidNightOrder(data, config, candle, i);
            }
        }
    }

    return response;
};
