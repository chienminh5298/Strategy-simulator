import { configType, StoplossType } from "@src/component/config/customize";
import { candleType } from "@src/redux/dataReducer";
import { roundQtyToNDecimal } from ".";
import { BINANCE_TAKER_FEE } from "@src/brokerFee";

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
    fee: number;
    isSpecialTarget: number;
};

export type dcaOpenOrderType = { id: number; entryTime: string; entryPrice: number; qty: number };

export type CreateNewOrderType = {
    candle: candleType;
    entryPrice: number;
    config: configType;
    isTrigger: boolean;
    side: "long" | "short";
    isSpecialTarget?: number;
};

export type ChartCandleType = {
    [date: string]: {
        candle: candleType;
        executedOrder?: Required<OrderType>[];
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

type IndexedCandle = candleType & { ts: number };

const prepareCandles = (data: { [k: string]: candleType }): IndexedCandle[] => {
    return Object.values(data)
        .map((c) => ({ ...c, ts: Date.parse(c.Date) }))
        .sort((a, b) => a.ts - b.ts);
};

// Hàm này lấy ra nến 5 phút nằm trong khoảng thời gian nào trong ngày.
// Ví dụ nếu timeFrame = 1h và candleDate = "2023-10-01T00:05:00Z" thì sẽ trả về "2023-10-01T00:00:00Z"
export const getBucketKey = (candleDate: string, timeFrame: "1h" | "4h" | "1d"): string => {
    const d = new Date(candleDate);
    if (timeFrame === "1d") {
        d.setUTCHours(0, 0, 0, 0);
    } else {
        d.setUTCMinutes(0, 0, 0);
        if (timeFrame === "4h") {
            const h = d.getUTCHours();
            d.setUTCHours(Math.floor(h / 4) * 4);
        }
    }
    return d.toISOString();
};

// Hàm này gom nến 5 phút thành nến 1h hoặc 4h hoặc 1d theo timeFrame
export const aggregateToMap = (data: { [date: string]: candleType }, timeFrame: "1h" | "4h" | "1d") => {
    const allCandles: IndexedCandle[] = prepareCandles(data);
    const map: Record<string, candleType> = {};
    for (const c of allCandles) {
        const key = getBucketKey(c.Date, timeFrame);
        if (!map[key]) {
            map[key] = { Date: key, Open: c.Open, High: c.High, Low: c.Low, Close: c.Close, Volume: c.Volume };
        } else {
            const agg = map[key];
            agg.High = Math.max(agg.High, c.High);
            agg.Low = Math.min(agg.Low, c.Low);
            agg.Close = c.Close;
            agg.Volume += c.Volume;
        }
    }
    return map;
};

export const backtestLogic = (data: { [date: string]: candleType }, config: configType) => {
    const timeFrame = config.setting.timeFrame;

    let chartData = aggregateToMap(data, timeFrame);

    const sortedBucketKeysChartData = Object.keys(chartData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    // const heikinAshiArr = toHeikinAshi(Object.values(chartData).sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()));
    const chartArr = Object.values(chartData).sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    const dataKey = Object.keys(data);
    const dataValues = Object.values(data);
    let openOrder: { [orderId: number]: OrderType } = {};
    let response: ChartCandleType = {};

    const getLastFiveCandle = (pivotUTC: string) => {
        const pivotKey = getBucketKey(pivotUTC, timeFrame);
        const idx = sortedBucketKeysChartData.indexOf(pivotKey);
        if (idx === -1 || idx < 5) {
            // Không tìm thấy pivotKey hoặc không đủ dữ liệu trước pivot
            return "MIXED";
        }
        // Bỏ mọi nến 5 m **>= pivot** (chỉ lấy dữ liệu trước pivot)
        const series = chartArr.slice(idx - 5, idx);
        const allGreen = series.every((c) => c.Close > c.Open);
        if (allGreen) return "GREEN";

        const allRed = series.every((c) => c.Close < c.Open);
        if (allRed) return "RED";

        return "MIXED";
    };

    // const getLastFiveHeikinAshiTrend = (pivotUTC: string): "GREEN" | "RED" | "MIXED" => {
    //     const pivotKey = getBucketKey(pivotUTC, timeFrame);
    //     // Tìm index của pivotKey
    //     const idx = sortedBucketKeysChartData.indexOf(pivotKey);
    //     if (idx === -1 || idx < 5) {
    //         // Không tìm thấy pivotKey hoặc không đủ dữ liệu trước pivot
    //         return "MIXED";
    //     }

    //     // Bỏ mọi nến 5 m **>= pivot** (chỉ lấy dữ liệu trước pivot)
    //     const haSeries = heikinAshiArr.slice(idx - 5, idx);

    //     const allGreen = haSeries.every((c) => c.haClose > c.haOpen);
    //     if (allGreen) return "GREEN";

    //     const allRed = haSeries.every((c) => c.haClose < c.haOpen);
    //     if (allRed) return "RED";

    //     return "MIXED";
    // };

    const getPrevCandle = (candledate: string) => {
        const bucketKey = getBucketKey(candledate, timeFrame);
        const idx = sortedBucketKeysChartData.indexOf(bucketKey);
        if (idx === -1 || idx === 0) {
            return null;
        }
        return chartData[sortedBucketKeysChartData[idx - 1]];
    };

    const processCreateNewCandleOrder = (config: configType, candle: candleType) => {
        const prevCandle = getPrevCandle(candle.Date);
        if (prevCandle) {
            const side = getNewOrderSide({ config, isTriggerOrder: false, prevCandle });
            createNewOrder({ candle, entryPrice: candle.Open, isTrigger: false, side, config });
        }
    };

    const checkHitTarget = (candle: candleType, config: configType) => {
        for (const orderId in openOrder) {
            const order = openOrder[orderId];

            const stoploss: StoplossType[] = order.isTrigger ? config.triggerStrategy.stoplosses : config.strategy.stoplosses;
            const markPrice = getMarkPRice(order.isSpecialTarget !== 0 ? order.isSpecialTarget : stoploss[order.stoplossIdx + 1].target, order.side, order.entryPrice);

            if ((order.side === "long" && candle.High >= markPrice) || (order.side === "short" && candle.Low <= markPrice)) {
                // Move stoploss by update stoplossIdx
                openOrder[order.id] = { ...openOrder[order.id], stoplossIdx: openOrder[order.id].stoplossIdx + 1 };
                // Check is last target
                if (order.stoplossIdx + 1 === stoploss.length - 1) {
                    // Check is strategy and trigger order is set
                    if (config.setting.isTrigger && !order.isTrigger) {
                        // new trigger order
                        const side = getTriggerOrderSide(order, config);

                        const trend5Series = getLastFiveCandle(candle.Date);
                        const trend5 = trend5Series === "MIXED";

                        // const trend = getLastFiveHeikinAshiTrend(candle.Date);
                        // const trendHeikin = (trend === "GREEN" && side === "short") || (trend === "RED" && side === "long");

                        if (trend5) {
                            createNewOrder({ candle, entryPrice: markPrice, config, isTrigger: true, side });
                        } else if (!trend5) {
                            createNewOrder({ candle, entryPrice: markPrice, config, isTrigger: true, side, isSpecialTarget: 0.8 });
                        }

                        // if ((trend === "GREEN" && side === "short") || (trend === "RED" && side === "long")) {
                        // } else {
                        //     createNewOrder({ candle, entryPrice: markPrice, config, isTrigger: true, side });
                        // }
                        // createNewOrder({ candle, entryPrice: markPrice, config, isTrigger: true, side });
                    }
                    // Close order
                    closeOrder(order, markPrice, candle);
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
            if ((order.side === "long" && candle.Low <= markPrice) || (order.side === "short" && candle.High >= markPrice)) {
                // close order
                closeOrder(order, markPrice, candle);
            }
        }
    };

    const createNewOrder = ({ candle, entryPrice, config, isTrigger, side, isSpecialTarget = 0 }: CreateNewOrderType) => {
        const orderId = randomId();
        const qty = config.token === "SOL" ? roundQtyToNDecimal(config.value / entryPrice, 1) : config.value / entryPrice;
        openOrder[orderId] = {
            id: orderId,
            entryTime: candle.Date,
            entryPrice,
            qty: qty,
            isTrigger,
            side,
            stoplossIdx: 0,
            fee: BINANCE_TAKER_FEE * qty * entryPrice,
            isSpecialTarget,
        };

        response[candle.Date] = { ...response[candle.Date], openOrderSide: side }; // This is not a part of logic
    };

    const closeOrder = (order: OrderType, markPrice: number, candle: candleType) => {
        if (openOrder[order.id]) {
            const tempProfit = getProfit({ qty: order.qty, side: order.side, markPrice, entryPrice: order.entryPrice });
            const commission = tempProfit > 0 ? tempProfit * 0.1 : 0;
            const profit = tempProfit - order.fee - commission; // If profit < 0 => profit = 0
            const tempOrder = { ...openOrder[order.id], markPrice, executedTime: candle.Date, profit };
            delete openOrder[order.id];

            response[candle.Date] = { ...response[candle.Date], executedOrder: [tempOrder] }; // This is not a part of logic
        }
    };

    //========================= Logic start from here ========================= //
    for (let i = 481; i < dataKey.length; i++) {
        const candle = dataValues[i];
        response[candle.Date] = { candle }; // This is not a part of logic

        checkHitStoploss(candle, config);
        checkHitTarget(candle, config);

        if (checkIsNewCandle(candle.Date, timeFrame)) {
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

    response = convertTo1hChart(response);

    return response;
};

const convertTo1hChart = (chart5m: ChartCandleType): ChartCandleType => {
    let response: ChartCandleType = {};

    // Convert the object values to an array and sort them by date ascending.
    const data5m = Object.values(chart5m).sort((a, b) => new Date(a.candle.Date).getTime() - new Date(b.candle.Date).getTime());

    // Group the 5-minute candles by 1-hour buckets.
    const groups: { [bucketKey: string]: typeof data5m } = {};
    for (const item of data5m) {
        const dateObj = new Date(item.candle.Date);
        // Set to the start of the hour
        const bucketDate = new Date(dateObj);
        bucketDate.setUTCMinutes(0, 0, 0);
        const bucketKey = bucketDate.toISOString();

        if (!groups[bucketKey]) {
            groups[bucketKey] = [];
        }
        groups[bucketKey].push(item);
    }

    // For each group, aggregate the candles if there are exactly 12 candles (5m x 12 = 60m).
    for (const bucketKey in groups) {
        const group = groups[bucketKey];
        if (group.length === 12) {
            const open = group[0].candle.Open;
            const close = group[11].candle.Close;
            const high = Math.max(...group.map((g) => g.candle.High));
            const low = Math.min(...group.map((g) => g.candle.Low));
            const volume = group.reduce((sum, g) => sum + g.candle.Volume, 0);

            const aggregatedCandle = {
                Date: bucketKey,
                Open: open,
                High: high,
                Low: low,
                Close: close,
                Volume: volume,
            };

            const executedOrder = group
                .filter((item) => item.executedOrder !== undefined)
                .map((item) => item.executedOrder)
                .flat()
                .sort((a, b) => new Date(b!.executedTime!).getTime() - new Date(a!.executedTime!).getTime());

            const openOrderSide = group.find((item) => item.openOrderSide)?.openOrderSide;

            response[bucketKey] = {
                candle: aggregatedCandle,
                executedOrder: executedOrder as Required<OrderType>[],
                openOrderSide,
            };
        }
    }

    return response;
};

type HACandle = {
    haOpen: number;
    haClose: number;
    haHigh: number;
    haLow: number;
};

/* --- Chuyển toàn bộ candleType sang Heikin‑Ashi --- */
export const toHeikinAshi = (series: candleType[]): HACandle[] => {
    const out: HACandle[] = [];
    for (let i = 0; i < series.length; i++) {
        const { Open, High, Low, Close } = series[i];
        const haClose = (Open + High + Low + Close) / 4;
        const haOpen =
            i === 0
                ? (Open + Close) / 2 // seed đầu tiên
                : (out[i - 1].haOpen + out[i - 1].haClose) / 2; // chuẩn

        const haHigh = Math.max(High, haOpen, haClose);
        const haLow = Math.min(Low, haOpen, haClose);
        out.push({ haOpen, haClose, haHigh, haLow });
    }
    return out;
};
