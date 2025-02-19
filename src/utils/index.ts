import { OrderType } from "@src/utils/backtestLogic";

export function convertToUTCDateTime(isoString: string) {
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
    targetHit: {
        [target: string]: {
            target: number;
            hitTimes: number;
        };
    };
};

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

export const processDataForAnalyse = (orders: Required<OrderType>[]) => {
    processValueOverTimeData(orders);
    const proftOrders = orders.filter((order) => order.profit > 0);
    const lossOrders = orders.filter((order) => order.profit < 0);

    const longOrders = orders.filter((order) => order.side === "long");
    const shortOrders = orders.filter((order) => order.side === "short");

    let overView: OverViewType = {
        totalPnL: orders.reduce((total, order) => total + order.profit, 0),
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
    };

    let ValueOverTimeChart: ValueOverTimeChartType[] = processValueOverTimeData(orders);
    let profitByMonthlyChart: ProfitByMonthlyChartType[] = processProfitByMonthlyData(orders);

    const strategyOrders = orders.filter((order) => order.isTrigger === false);
    const triggerStrategyOrders = orders.filter((order) => order.isTrigger === true);

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
        targetHit: {},
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
        targetHit: {},
    };

    return { overView, ValueOverTimeChart, profitByMonthlyChart, strategyBreakDown, triggerStrategyBreakDown };
};
