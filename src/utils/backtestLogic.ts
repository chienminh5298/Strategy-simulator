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
};

export type dcaOpenOrderType = { id: number; entryTime: string; entryPrice: number; qty: number };

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
                    // Check is strategy and trigger order is set
                    if (config.setting.isTrigger && !order.isTrigger) {
                        // new trigger order
                        const side = getTriggerOrderSide(order, config);
                        const trend = lastFiveHATrend(dataValues, candle.Date);
                        if ((trend === "GREEN" && side === "short") || (trend === "RED" && side === "long")) {
                            console.log(candle.Date)
                        } else {
                            createNewOrder({ candle, entryPrice: markPrice, config, isTrigger: true, side });
                        }
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

    type CreateNewOrderType = {
        candle: candleType;
        entryPrice: number;
        config: configType;
        isTrigger: boolean;
        side: "long" | "short";
    };

    const createNewOrder = ({ candle, entryPrice, config, isTrigger, side }: CreateNewOrderType) => {
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
        };

        response[candle.Date] = { ...response[candle.Date], openOrderSide: side }; // This is not a part of logic
    };

    const closeOrder = (order: OrderType, markPrice: number, candle: candleType) => {
        if (openOrder[order.id]) {
            const profit = getProfit({ qty: order.qty, side: order.side, markPrice, entryPrice: order.entryPrice }) - order.fee;
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

type DailyOHLC = { open: number; high: number; low: number; close: number };
type HACandle = {
    haOpen: number;
    haClose: number;
    haHigh: number;
    haLow: number;
};

/* --- 1. Gom nến 5 m thành daily OHLC (00:00 UTC → 23:55 UTC) --- */
function aggregateDailyUTC(candles: candleType[]): DailyOHLC[] {
    const buckets = new Map<number, DailyOHLC>(); // key = Unix‑day (UTC)

    for (const c of candles) {
        const t = Date.parse(c.Date); // ms UTC
        const dayId = Math.floor(t / 86_400_000); // số ngày từ 1970‑01‑01
        const bucket = buckets.get(dayId);

        if (!bucket) {
            buckets.set(dayId, { open: c.Open, high: c.High, low: c.Low, close: c.Close });
        } else {
            bucket.high = Math.max(bucket.high, c.High);
            bucket.low = Math.min(bucket.low, c.Low);
            bucket.close = c.Close;
        }
    }

    // sắp xếp theo thời gian tăng dần
    return [...buckets.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
}

/* --- 2. Chuyển toàn bộ daily‑OHLC sang Heikin‑Ashi --- */
function toHeikinAshi(series: DailyOHLC[]): HACandle[] {
    const out: HACandle[] = [];
    for (let i = 0; i < series.length; i++) {
        const { open, high, low, close } = series[i];
        const haClose = (open + high + low + close) / 4;
        const haOpen =
            i === 0
                ? (open + close) / 2 // seed đầu tiên
                : (out[i - 1].haOpen + out[i - 1].haClose) / 2; // chuẩn

        const haHigh = Math.max(high, haOpen, haClose);
        const haLow = Math.min(low, haOpen, haClose);
        out.push({ haOpen, haClose, haHigh, haLow });
    }
    return out;
}

/* --- 3. Kiểm tra 5 nến HA ngay trước pivot có cùng màu --- */
export function lastFiveHATrend(raw5m: candleType[], pivotUTC: Date | string): "GREEN" | "RED" | "MIXED" {
    const pivot = typeof pivotUTC === "string" ? new Date(pivotUTC) : pivotUTC;

    // Bỏ mọi nến 5 m **>= pivot** (chỉ lấy dữ liệu trước pivot)
    const history = raw5m.filter((c) => new Date(c.Date) < pivot);

    const dailySeries = aggregateDailyUTC(history);
    if (dailySeries.length < 6) return "MIXED"; // thiếu dữ liệu

    const haSeries = toHeikinAshi(dailySeries);
    const lastFive = haSeries.slice(-5); // D‑5 … D‑1

    const allGreen = lastFive.every((c) => c.haClose > c.haOpen);
    if (allGreen) return "GREEN";

    const allRed = lastFive.every((c) => c.haClose < c.haOpen);
    if (allRed) return "RED";

    return "MIXED";
}
