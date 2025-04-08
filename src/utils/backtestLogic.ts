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

type GetNewOrderSideType = {
    config: configType;
    isTriggerOrder: boolean;
    prevCandle: candleType;
};

const getNewOrderSide = ({ config, isTriggerOrder, prevCandle }: GetNewOrderSideType) => {
    const prevCandleColor = getDayColor(prevCandle);
    if (!isTriggerOrder) {
        if (config.strategy.direction === "same") return prevCandleColor === "green" ? "long" : "short";
        else return prevCandleColor === "green" ? "short" : "long";
    } else {
        if ((config.strategy.direction === "same" && config.triggerStrategy.direction === "same") || (config.strategy.direction === "opposite" && config.triggerStrategy.direction === "opposite")) return prevCandleColor === "green" ? "long" : "short";
        else return prevCandleColor === "green" ? "short" : "long";
    }
};

export const getDayColor = (prevCandle: candleType) => {
    if (prevCandle.Open > prevCandle.Close) return "red";
    else return "green";
};

export const checkIsNewCandle = (UTCstring: string, timeFrame: "1h" | "4h" | "1d") => {
    const date = new Date(UTCstring);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    if (timeFrame === "1h" && minutes === 0) return true;
    if (timeFrame === "4h" && hours % 4 === 0 && minutes === 0) return true;
    if (timeFrame === "1d" && hours === 0 && minutes === 0) return true;
    return false;
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

    const getPrevCandle = (config: configType, candle: candleType): candleType => {
        const timeFrameToMinutes = (timeFrame: string): number => {
            const unit = timeFrame.slice(-1);
            const value = parseInt(timeFrame.slice(0, -1));
            if (unit === "m") return value;
            if (unit === "h") return value * 60;
            if (unit === "d") return value * 60 * 24;
            return 5; // fallback to 5 minutes
        };

        const getPreviousTimeFrameRange = (dateStr: string, minutes: number): string[] => {
            const endDate = new Date(dateStr);
            endDate.setMinutes(endDate.getMinutes() - 5); // exclude current candle

            const startDate = new Date(endDate);
            startDate.setMinutes(startDate.getMinutes() - minutes + 5);

            const timestamps: string[] = [];
            for (let d = new Date(startDate); d <= endDate; d.setMinutes(d.getMinutes() + 5)) {
                const iso = d.toISOString().slice(0, 19) + ".000Z";
                timestamps.push(iso);
            }

            return timestamps;
        };

        const frameMinutes = timeFrameToMinutes(config.setting.timeFrame);
        const rangeTimestamps = getPreviousTimeFrameRange(candle.Date, frameMinutes);
        const candles = rangeTimestamps.map((ts) => data[ts]).filter(Boolean);

        return {
            Date: rangeTimestamps[0],
            Open: candles[0].Open,
            High: Math.max(...candles.map((c) => c.High)),
            Low: Math.min(...candles.map((c) => c.Low)),
            Close: candles[candles.length - 1].Close,
            Volume: candles.reduce((sum, c) => sum + c.Volume, 0),
        };
    };

    const processCreateNewCandleOrder = (config: configType, candle: candleType) => {
        const prevCandle = getPrevCandle(config, candle);
        console.log(prevCandle);
        const side = getNewOrderSide({ config, isTriggerOrder: false, prevCandle });
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

        if (checkIsNewCandle(candle.Date, config.setting.timeFrame)) {
            // Check if exsist open order
            if (Object.keys(openOrder).length > 0) {
                // Check setting is order close before new candle
                if (config.setting.closeOrderBeforeNewCandle) {
                    // Close all order
                    for (const orderId in openOrder) {
                        const order = openOrder[orderId];
                        const markPrice = candle.Open; // We close order at mid night => markPrice is open price
                        closeOrder(order, markPrice, candle);
                    }

                    // Create new order
                    processCreateNewCandleOrder(config, candle);

                    // Check hit stoploss for new oder just opned (In case hit stoploss at first candle of the day)
                    checkHitStoploss(candle, config);
                    checkHitTarget(candle, config);
                } else {
                    // If order keep over night => Do nothing, let order keep running
                }
            } else {
                // Create new order
                processCreateNewCandleOrder(config, candle);

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
