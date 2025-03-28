import { configType, StoplossType } from "@src/component/config/customize";
import { candleType } from "@src/redux/dataReducer";

export type OrderType = {
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

export type dcaOpenOrderType = { id: number; entryTime: string; entryPrice: number; qty: number };

export type ChartCandleType = {
    [date: string]: {
        candle: candleType;
        executedOrder?: Required<OrderType>;
        openOrderSide?: "long" | "short";
        openOrder?: dcaOpenOrderType;
        dcaExecutedOrder?: Required<OrderType>[]; // Optional, for DCA orders
    };
};

export const getOpenCandle = (candle: candleType) => {
    const temp = new Date(candle.Date);
    const year = temp.getFullYear();
    const month = String(temp.getMonth() + 1).padStart(2, "0"); // Two-digit month
    const day = String(temp.getDate()).padStart(2, "0"); // Two-digit day
    return `${year}-${month}-${day}T00:00:00.000Z`;
};

export const getCloseCandle = (candle: candleType) => {
    const temp = new Date(candle.Date);
    const year = temp.getFullYear();
    const month = String(temp.getMonth() + 1).padStart(2, "0"); // Two-digit month
    const day = String(temp.getDate()).padStart(2, "0"); // Two-digit day

    return `${year}-${month}-${day}T23:55:00.000Z`;
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

export const getDayColor = (openCandle: candleType, closeCandle: candleType) => {
    if (openCandle.Open > closeCandle.Close) return "red";
    else return "green";
};

export const checkIsMidNight = (UTCstring: string) => {
    const date = new Date(UTCstring);
    return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
};

export const getMarkPRice = (percent: number, side: "long" | "short", entryPrice: number) => {
    if (side === "long") {
        return entryPrice + (percent * entryPrice) / 100;
    } else {
        return entryPrice - (percent * entryPrice) / 100;
    }
};

export const getProfit = ({ qty, side, markPrice, entryPrice }: { qty: number; side: "long" | "short"; markPrice: number; entryPrice: number }) => {
    if (side === "long") {
        return (markPrice - entryPrice) * qty;
    } else {
        return (entryPrice - markPrice) * qty;
    }
};
export const randomId = () => Math.floor(100000000 + Math.random() * 900000000);

export const backtestLogic = (data: { [date: string]: candleType }, config: configType) => {
    const dataKey = Object.keys(data);
    const dataValues = Object.values(data);
    let openOrder: { [orderId: number]: OrderType } = {};
    let response: ChartCandleType = {};
    const processCreateNewMidNightOrder = (data: { [date: string]: candleType }, config: configType, candle: candleType, i: number) => {
        const prevDayOpenCandle = data[getOpenCandle(candle)];
        const prevDayCloseCandle = data[getCloseCandle(candle)];
        const side = getNewOrderSide({ config, isTriggerOrder: false, openCandle: prevDayOpenCandle, closeCandle: prevDayCloseCandle });
        createNewOrder({ candle, entryPrice: candle.Open, isTrigger: false, side, config });
    };

    const checkHitTarget = (candle: candleType, config: configType) => {
        for (const orderId in openOrder) {
            const order = openOrder[orderId];

            const stoploss: StoplossType[] = order.isTrigger ? config.triggerStrategy.stoplosses : config.strategy.stoplosses;
            const markPrice = getMarkPRice(stoploss[order.stoplossIdx + 1].target, order.side, order.entryPrice);

            if ((order.side === "long" && candle.High >= markPrice) || (order.side === "short" && candle.Low <= markPrice)) {
                // Move stoploss by update stoplossIdx
                openOrder[order.id] = { ...openOrder[order.id], stoplossIdx: openOrder[order.id].stoplossIdx + 1 };
                // Check is last target
                if (order.stoplossIdx + 1 === stoploss.length - 1) {
                    //// Close order
                    // Check strategy or triggerStrategy
                    if (!order.isTrigger) {
                        // Close strategy order
                        closeOrder(order, markPrice, candle);

                        if (config.setting.isTrigger) {
                            // new trigger order
                            const side = getTriggerOrderSide(order, config);
                            createNewOrder({ candle, entryPrice: markPrice, config, isTrigger: true, side });
                        }
                    } else {
                        closeOrder(order, markPrice, candle);
                    }
                } else {
                }
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

    //========================= Logic start from here ========================= //
    for (let i = 481; i < dataKey.length; i++) {
        const candle = dataValues[i];
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

                // Check hit stoploss for new oder just opned (In case hit stoploss at first candle of the day)
                checkHitStoploss(candle, config);
                checkHitTarget(candle, config);
            }
        }
    }

    response = convertTo15mChart(response);

    return response;
};

const convertTo15mChart = (chart5m: ChartCandleType): ChartCandleType => {
    let response: ChartCandleType = {};

    // Convert the object values to an array and sort them by date ascending.
    const data5m = Object.values(chart5m).sort((a, b) => new Date(a.candle.Date).getTime() - new Date(b.candle.Date).getTime());

    // Group the 5-minute candles by 15-minute buckets.
    // For example, candles at 00:00, 00:05, and 00:10 fall into the same bucket.
    const groups: { [bucketKey: string]: typeof data5m } = {};
    for (const item of data5m) {
        const dateObj = new Date(item.candle.Date);
        // Calculate the bucket's starting minute (0, 15, 30, or 45)
        const bucketStartMinutes = Math.floor(dateObj.getUTCMinutes() / 15) * 15;
        // Create a new Date representing the bucket's start time
        const bucketDate = new Date(dateObj);
        bucketDate.setUTCMinutes(bucketStartMinutes, 0, 0);
        const bucketKey = bucketDate.toISOString();

        if (!groups[bucketKey]) {
            groups[bucketKey] = [];
        }
        groups[bucketKey].push(item);
    }

    // For each group, aggregate the candles if there are exactly 3 candles.
    // (You can adjust the logic if you want to handle incomplete groups.)
    for (const bucketKey in groups) {
        const group = groups[bucketKey];
        if (group.length === 3) {
            const open = group[0].candle.Open;
            const close = group[2].candle.Close;
            const high = Math.max(group[0].candle.High, group[1].candle.High, group[2].candle.High);
            const low = Math.min(group[0].candle.Low, group[1].candle.Low, group[2].candle.Low);
            const volume = group[0].candle.Volume + group[1].candle.Volume + group[2].candle.Volume;

            // Use the bucket's starting time as the aggregated candle's Date.
            const aggregatedCandle = {
                Date: bucketKey,
                Open: open,
                High: high,
                Low: low,
                Close: close,
                Volume: volume,
            };

            // If any candle in the group has executedOrder or openOrderSide, pick the first available.
            const executedOrder = group[0].executedOrder || group[1].executedOrder || group[2].executedOrder;
            const openOrderSide = group[0].openOrderSide || group[1].openOrderSide || group[2].openOrderSide;

            response[bucketKey] = {
                candle: aggregatedCandle,
                executedOrder,
                openOrderSide,
            };
        }
    }

    return response;
};
