import { checkIsNewCandle, OrderType } from "@src/utils/backtestLogic";
import { configType } from "@src/component/config/customize";
import { candleType } from "@src/redux/dataReducer";

export function convertToUTCDateTime(isoString: string | undefined | JSX.Element) {
    if (typeof isoString !== "string") return "";
    // Create a Date object from the ISO string
    const date = new Date(isoString);

    // Format the date and time in UTC (YYYY-MM-DD HH:MM:SS)
    const utcDateTime = date.getUTCFullYear() + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0") + " " + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0") + ":" + String(date.getUTCSeconds()).padStart(2, "0");

    return utcDateTime;
}

export const toUSD = (value: number | string = 0, sign: boolean = true, maximumFractionDigits: number = 2): string => {
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        signDisplay: value === 0 || !sign ? "never" : "always",
        minimumFractionDigits: 2,
        maximumFractionDigits: maximumFractionDigits,
    });
};

export type OverViewType = {
    totalPnL: number;
    fee: number;
    winRate: number;
    lossRate: number;
    totalTrade: number;
    averangeProfit: number;
    averangeLoss: number;
    longOrder: number;
    longProfit: number;
    longLoss: number;
    shortOrder: number;
    shortProfit: number;
    shortLoss: number;
    profitPercent: number;
    highestLoss: number;
    highestProfit: number;
    maxDrawdown: number;
};

export type ValueOverTimeChartType = {
    date: string;
    value: number;
};

export type ProfitByMonthlyChartType = {
    month: string;
    total: number;
    profit: number;
    loss: number;
};

export type StrategyBreakDownType = {
    totalPnL: number;
    winRate: number;
    lossRate: number;
    longOrder: number;
    longProfit: number;
    longLoss: number;
    shortOrder: number;
    shortProfit: number;
    shortLoss: number;
    targetHit: number[];
};

// This function will convert data to week data
function processValueOverTimeData(orders: Required<OrderType>[]) {
    let weeklyProfit: ValueOverTimeChartType[] = [];
    let currentProfit = 0;
    let currentCount = 0;

    for (const order of orders) {
        currentProfit += order.profit;
        if (currentCount < 7) {
            currentCount += 1;
        } else {
            currentCount = 0; // Reset count
            weeklyProfit.push({
                date: order.entryTime.split("T")[0],
                value: currentProfit,
            });
        }
    }

    if (currentCount !== 0) {
        const lastDate = orders[orders.length - 1];
        weeklyProfit.push({
            date: lastDate.entryTime.split("T")[0],
            value: currentProfit,
        });
    }

    return weeklyProfit;
}

function processProfitByMonthlyData(orders: Required<OrderType>[]) {
    let initialData = {
        Jan: { month: "January", total: 0, profit: 0, loss: 0 },
        Feb: { month: "February", total: 0, profit: 0, loss: 0 },
        Mar: { month: "March", total: 0, profit: 0, loss: 0 },
        Apr: { month: "April", total: 0, profit: 0, loss: 0 },
        May: { month: "May", total: 0, profit: 0, loss: 0 },
        Jun: { month: "June", total: 0, profit: 0, loss: 0 },
        Jul: { month: "July", total: 0, profit: 0, loss: 0 },
        Aug: { month: "August", total: 0, profit: 0, loss: 0 },
        Sep: { month: "September", total: 0, profit: 0, loss: 0 },
        Oct: { month: "October", total: 0, profit: 0, loss: 0 },
        Nov: { month: "November", total: 0, profit: 0, loss: 0 },
        Dec: { month: "December", total: 0, profit: 0, loss: 0 },
    };

    for (const order of orders) {
        const month = new Date(order.entryTime).getMonth() + 1;
        switch (month) {
            case 1:
                initialData["Jan"].total += order.profit;
                if (order.profit > 0) initialData["Jan"].profit += order.profit;
                if (order.profit < 0) initialData["Jan"].loss += Math.abs(order.profit);
                break;
            case 2:
                initialData["Feb"].total += order.profit;
                if (order.profit > 0) initialData["Feb"].profit += order.profit;
                if (order.profit < 0) initialData["Feb"].loss += Math.abs(order.profit);
                break;
            case 3:
                initialData["Mar"].total += order.profit;
                if (order.profit > 0) initialData["Mar"].profit += order.profit;
                if (order.profit < 0) initialData["Mar"].loss += Math.abs(order.profit);
                break;
            case 4:
                initialData["Apr"].total += order.profit;
                if (order.profit > 0) initialData["Apr"].profit += order.profit;
                if (order.profit < 0) initialData["Apr"].loss += Math.abs(order.profit);
                break;
            case 5:
                initialData["May"].total += order.profit;
                if (order.profit > 0) initialData["May"].profit += order.profit;
                if (order.profit < 0) initialData["May"].loss += Math.abs(order.profit);
                break;
            case 6:
                initialData["Jun"].total += order.profit;
                if (order.profit > 0) initialData["Jun"].profit += order.profit;
                if (order.profit < 0) initialData["Jun"].loss += Math.abs(order.profit);
                break;
            case 7:
                initialData["Jul"].total += order.profit;
                if (order.profit > 0) initialData["Jul"].profit += order.profit;
                if (order.profit < 0) initialData["Jul"].loss += Math.abs(order.profit);
                break;
            case 8:
                initialData["Aug"].total += order.profit;
                if (order.profit > 0) initialData["Aug"].profit += order.profit;
                if (order.profit < 0) initialData["Aug"].loss += Math.abs(order.profit);
                break;
            case 9:
                initialData["Sep"].total += order.profit;
                if (order.profit > 0) initialData["Sep"].profit += order.profit;
                if (order.profit < 0) initialData["Sep"].loss += Math.abs(order.profit);
                break;
            case 10:
                initialData["Oct"].total += order.profit;
                if (order.profit > 0) initialData["Oct"].profit += order.profit;
                if (order.profit < 0) initialData["Oct"].loss += Math.abs(order.profit);
                break;
            case 11:
                initialData["Nov"].total += order.profit;
                if (order.profit > 0) initialData["Nov"].profit += order.profit;
                if (order.profit < 0) initialData["Nov"].loss += Math.abs(order.profit);
                break;
            default:
                initialData["Dec"].total += order.profit;
                if (order.profit > 0) initialData["Dec"].profit += order.profit;
                if (order.profit < 0) initialData["Dec"].loss += Math.abs(order.profit);
        }
    }
    return Object.values(initialData);
}

export const processConfigDataForAnalyse = (orders: Required<OrderType>[], config: configType) => {
    processValueOverTimeData(orders);
    const fee = orders.reduce((total, o) => total + o.fee, 0);

    const proftOrders = orders.filter((order) => order.profit > 0);
    const lossOrders = orders.filter((order) => order.profit < 0);

    const longOrders = orders.filter((order) => order.side === "long");
    const shortOrders = orders.filter((order) => order.side === "short");

    let maxDrawdown = 0;
    let peak = 0;
    let cumulative = 0;

    for (const order of orders) {
        cumulative += order.profit;
        if (cumulative > peak) {
            peak = cumulative;
        }
        const drawdown = peak - cumulative;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    let highestLoss = 0;
    let highestProfit = 0;
    const totalPnL = orders.reduce((total, order) => {
        const current = total + order.profit;
        if (current < highestLoss) {
            highestLoss = current;
        }
        if (current > highestProfit) {
            highestProfit = current;
        }
        return current;
    }, 0);

    let overView: OverViewType = {
        totalPnL: totalPnL,
        fee: fee,
        highestLoss,
        highestProfit,
        winRate: (proftOrders.length * 100) / orders.length,
        lossRate: (lossOrders.length * 100) / orders.length,
        totalTrade: orders.length,
        averangeProfit: proftOrders.reduce((total, order) => total + order.profit, 0) / proftOrders.length,
        averangeLoss: lossOrders.reduce((total, order) => total + order.profit, 0) / lossOrders.length,
        longOrder: longOrders.length,
        longProfit: longOrders.reduce((total, order) => {
            if (order.profit > 0) {
                return total + order.profit;
            } else return total;
        }, 0),
        longLoss: longOrders.reduce((total, order) => {
            if (order.profit < 0) {
                return total + order.profit;
            } else return total;
        }, 0),
        shortOrder: shortOrders.length,
        shortProfit: shortOrders.reduce((total, order) => {
            if (order.profit > 0) {
                return total + order.profit;
            } else return total;
        }, 0),
        shortLoss: shortOrders.reduce((total, order) => {
            if (order.profit < 0) {
                return total + order.profit;
            } else return total;
        }, 0),
        profitPercent: (totalPnL * 100) / config.value,
        maxDrawdown: maxDrawdown,
    };

    let ValueOverTimeChart: ValueOverTimeChartType[] = processValueOverTimeData(orders);
    let profitByMonthlyChart: ProfitByMonthlyChartType[] = processProfitByMonthlyData(orders);

    const strategyOrders = orders.filter((order) => order.isTrigger === false);
    const triggerStrategyOrders = orders.filter((order) => order.isTrigger === true);

    let countHitTargetStrategy: number[] = Array(config.strategy.stoplosses.length).fill(0);
    strategyOrders.forEach((order) => {
        for (let i = 0; i <= order.stoplossIdx; i++) {
            countHitTargetStrategy[i + 1]++;
        }
    });
    let countHitTargetTriggerStrategy: number[] = Array(config.triggerStrategy.stoplosses.length).fill(0);
    triggerStrategyOrders.forEach((order) => {
        for (let i = 0; i <= order.stoplossIdx; i++) {
            countHitTargetTriggerStrategy[i + 1]++;
        }
    });

    let strategyBreakDown: StrategyBreakDownType = {
        totalPnL: strategyOrders.reduce((total, order) => total + order.profit, 0),
        winRate: (strategyOrders.filter((order) => order.profit > 0).length * 100) / strategyOrders.length,
        lossRate: (strategyOrders.filter((order) => order.profit < 0).length * 100) / strategyOrders.length,
        longOrder: strategyOrders.filter((order) => order.side === "long").length,
        longProfit: strategyOrders.reduce((total, order) => {
            if (order.side === "long" && order.profit > 0) return total + order.profit;
            else return total;
        }, 0),
        longLoss: strategyOrders.reduce((total, order) => {
            if (order.side === "long" && order.profit < 0) return total + order.profit;
            else return total;
        }, 0),
        shortOrder: strategyOrders.filter((order) => order.side === "short").length,
        shortProfit: strategyOrders.reduce((total, order) => {
            if (order.side === "short" && order.profit > 0) return total + order.profit;
            else return total;
        }, 0),
        shortLoss: strategyOrders.reduce((total, order) => {
            if (order.side === "short" && order.profit < 0) return total + order.profit;
            else return total;
        }, 0),
        targetHit: countHitTargetStrategy,
    };
    let triggerStrategyBreakDown: StrategyBreakDownType = {
        totalPnL: triggerStrategyOrders.reduce((total, order) => total + order.profit, 0),
        winRate: (triggerStrategyOrders.filter((order) => order.profit > 0).length * 100) / triggerStrategyOrders.length,
        lossRate: (triggerStrategyOrders.filter((order) => order.profit < 0).length * 100) / triggerStrategyOrders.length,
        longOrder: triggerStrategyOrders.filter((order) => order.side === "long").length,
        longProfit: triggerStrategyOrders.reduce((total, order) => {
            if (order.side === "long" && order.profit > 0) return total + order.profit;
            else return total;
        }, 0),
        longLoss: triggerStrategyOrders.reduce((total, order) => {
            if (order.side === "long" && order.profit < 0) return total + order.profit;
            else return total;
        }, 0),
        shortOrder: triggerStrategyOrders.filter((order) => order.side === "short").length,
        shortProfit: triggerStrategyOrders.reduce((total, order) => {
            if (order.side === "short" && order.profit > 0) return total + order.profit;
            else return total;
        }, 0),
        shortLoss: triggerStrategyOrders.reduce((total, order) => {
            if (order.side === "short" && order.profit < 0) return total + order.profit;
            else return total;
        }, 0),
        targetHit: countHitTargetTriggerStrategy,
    };

    return { overView, ValueOverTimeChart, profitByMonthlyChart, strategyBreakDown, triggerStrategyBreakDown };
};

// This function will convert candle 5m to candle 1D
export const getDayData = (data: { [date: string]: candleType }) => {
    const dataValues = Object.values(data);
    let dayData: {
        [date: string]: {
            Open: number;
            Date: string;
            High: number;
            Low: number;
            Close: number;
            Volume: number;
        };
    } = {};
    for (let i = 481; i < dataValues.length; i++) {
        const candle = dataValues[i];
        const date = candle.Date.split("T")[0];
        if (checkIsNewCandle(candle.Date, "1d")) {
            dayData[date] = {
                Open: candle.Open,
                Date: date,
                Low: candle.Low,
                High: candle.High,
                Close: data[`${date}T23:55:00.000Z`].Close,
                Volume: candle.Volume,
            };
        } else {
            if (dayData[date]) {
                if (candle.Close < dayData[date].Low) {
                    dayData[date].Low = candle.Low;
                }
                if (candle.High > dayData[date].High) {
                    dayData[date].High = candle.High;
                }
            }
        }
    }

    return dayData;
};

export const getHourlyData = (data: { [date: string]: candleType }) => {
    const dataValues = Object.values(data);

    let hourlyData: {
        [hourKey: string]: {
            Open: number;
            Date: string;
            High: number;
            Low: number;
            Close: number;
            Volume: number;
        };
    } = {};

    for (let i = 481; i < dataValues.length; i++) {
        const candle = dataValues[i];
        const date = new Date(candle.Date);

        const hourKey = date.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
        const minute = date.getUTCMinutes();

        if (minute === 0) {
            // Nến đầu giờ
            hourlyData[hourKey] = {
                Open: candle.Open,
                Date: hourKey + ":00:00.000Z",
                High: candle.High,
                Low: candle.Low,
                Close: candle.Close,
                Volume: candle.Volume,
            };
        } else {
            if (hourlyData[hourKey]) {
                if (candle.Low < hourlyData[hourKey].Low) {
                    hourlyData[hourKey].Low = candle.Low;
                }
                if (candle.High > hourlyData[hourKey].High) {
                    hourlyData[hourKey].High = candle.High;
                }
                // Cập nhật close theo cây nến mới nhất
                hourlyData[hourKey].Close = candle.Close;
            }
        }
    }

    return hourlyData;
};

export const get4hData = (data: { [date: string]: candleType }) => {
    const dataValues = Object.values(data);

    let data4H: {
        [key: string]: {
            Open: number;
            Date: string;
            High: number;
            Low: number;
            Close: number;
            Volume: number;
        };
    } = {};

    for (let i = 481; i < dataValues.length; i++) {
        const candle = dataValues[i];
        const date = new Date(candle.Date);

        // Tính key theo từng khung 4 giờ
        const utcYear = date.getUTCFullYear();
        const utcMonth = date.getUTCMonth() + 1;
        const utcDay = date.getUTCDate();
        const utcHour = date.getUTCHours();
        const groupHour = Math.floor(utcHour / 4) * 4; // Nhóm theo 0, 4, 8, 12, 16, 20

        const key = `${utcYear}-${String(utcMonth).padStart(2, "0")}-${String(utcDay).padStart(2, "0")}T${String(groupHour).padStart(2, "0")}:00:00.000Z`;

        if (!data4H[key]) {
            data4H[key] = {
                Open: candle.Open,
                Date: key,
                High: candle.High,
                Low: candle.Low,
                Close: candle.Close,
                Volume: candle.Volume,
            };
        } else {
            data4H[key].High = Math.max(data4H[key].High, candle.High);
            data4H[key].Low = Math.min(data4H[key].Low, candle.Low);
            data4H[key].Close = candle.Close;
            data4H[key].Volume += candle.Volume;
        }
    }

    return data4H;
};

export const roundQtyToNDecimal: (price: string | number, minQty: number) => number = (price: string | number, minQty: number) => {
    const precision = getPrecisionDigits(minQty);
    var indexOfDot = price.toString().indexOf(".");
    var result = price;
    if (indexOfDot !== -1) {
        result = price.toString().slice(0, indexOfDot + precision + 1);
    }
    result = result.toString();
    return parseFloat(result);
};

const getPrecisionDigits = (floatNum: number) => {
    if (!Number.isFinite(floatNum)) {
        return 0; // Return 0 if it's not a valid finite number
    }

    // Convert the number to a string
    const floatStr = floatNum.toString();

    // Check if there's a decimal point
    if (floatStr.includes(".")) {
        // Return the length of digits after the decimal point
        return floatStr.split(".")[1].length;
    }

    return 0; // Return 0 if there's no decimal point
};

export const merge5mTo1hFromObject = (dayData: { [date: string]: candleType }): candleType[] => {
    const entries = Object.values(dayData).sort((a, b) => {
        return new Date(a.Date).getTime() - new Date(b.Date).getTime();
    });

    const groups: { [hourKey: string]: candleType[] } = {};

    for (const entry of entries) {
        const timestamp = new Date(entry.Date).getTime();
        const hourKey = new Date(timestamp - (timestamp % (60 * 60 * 1000))).toISOString();

        if (!groups[hourKey]) {
            groups[hourKey] = [];
        }

        groups[hourKey].push(entry);
    }

    const result: candleType[] = [];

    for (const hourKey of Object.keys(groups).sort()) {
        const group = groups[hourKey];

        result.push({
            Open: group[0].Open,
            Close: group[group.length - 1].Close,
            High: Math.max(...group.map((d) => d.High)),
            Low: Math.min(...group.map((d) => d.Low)),
            Volume: group.reduce((acc, d) => acc + d.Volume, 0),
            Date: hourKey,
        });
    }

    return result;
};
