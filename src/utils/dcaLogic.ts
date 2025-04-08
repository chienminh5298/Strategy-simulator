import { DCAConfig } from "@src/redux/dcaReducer";
import { candleType } from "@src/redux/dataReducer";
import { ChartCandleType, OrderType, randomId } from "@src/utils/backtestLogic";
import { getHourlyData } from ".";

function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

type Individual = {
    config: DCAConfig;
    fitness: number;
};

export const dcaLogic = (rcConfig: DCAConfig, data: { [date: string]: candleType }) => {
    const POP_SIZE = 100;
    const GENERATIONS = 10;

    let population: Individual[] = Array.from({ length: POP_SIZE }, () => {
        const config = randomConfig(rcConfig);
        return {
            config,
            fitness: simulateDCA(rcConfig, data, true) as number,
        };
    });

    for (let gen = 0; gen < GENERATIONS; gen++) {
        population.sort((a, b) => b.fitness - a.fitness);
        const parents = population.slice(0, 2); // Select the top 2 individuals as parents
        const newPopulation: Individual[] = [...parents];

        while (newPopulation.length < POP_SIZE) {
            const childConfig = mutateConfig(crossoverConfig(parents[0].config, parents[1].config));
            const fitness = simulateDCA(rcConfig, data, true) as number;
            newPopulation.push({ config: childConfig, fitness });
        }

        population = newPopulation;
    }
    const best = population.reduce((best, current) => (current.fitness > best.fitness ? current : best));
    return best.config;
};

const generateArray = (from: number, to: number, step: number) => {
    let arr = [];
    for (let i = from; i <= to; i += step) {
        arr.push(i);
    }
    return arr;
};

function randomConfig(rcConfig: DCAConfig): DCAConfig {
    return {
        ...rcConfig,
        totalOrder: randomPick(generateArray(10, 100, 10)),
        profitPercent: randomPick(generateArray(1, 10, 0.2)),
        isRSI: randomPick([true, false]),
        rsiLength: randomPick(generateArray(5, 24, 1)),
        rsiDcaIn: randomPick(generateArray(10, 45, 1)),
        rsiDcaOut: randomPick(generateArray(50, 70, 1)),
        buyCondition: randomPick(["avg", "min"]),
    };
}

function mutateConfig(config: DCAConfig): DCAConfig {
    const mutationRate = 0.3; // 10% chance to mutate each parameter
    const buyConditions: ("min" | "avg")[] = ["min", "avg"];

    return {
        ...config,
        totalOrder: Math.random() < mutationRate ? randomPick(generateArray(10, 100, 10)) : config.totalOrder,
        profitPercent: Math.random() < mutationRate ? randomPick(generateArray(1, 10, 0.2)) : config.profitPercent,
        isRSI: Math.random() < mutationRate ? !config.isRSI : config.isRSI,
        rsiLength: Math.random() < mutationRate ? randomPick(generateArray(5, 24, 1)) : config.rsiLength,
        rsiDcaIn: Math.random() < mutationRate ? randomPick(generateArray(10, 45, 1)) : config.rsiDcaIn,
        rsiDcaOut: Math.random() < mutationRate ? randomPick(generateArray(50, 70, 1)) : config.rsiDcaOut,
        buyCondition: Math.random() < mutationRate ? randomPick(buyConditions.filter((opt) => opt !== config.buyCondition)) : config.buyCondition,
    };
}

function crossoverConfig(a: DCAConfig, b: DCAConfig): DCAConfig {
    return {
        ...a,
        totalOrder: Math.random() < 0.5 ? a.totalOrder : b.totalOrder,
        profitPercent: Math.random() < 0.5 ? a.profitPercent : b.profitPercent,
        isRSI: Math.random() < 0.5 ? a.isRSI : b.isRSI,
        rsiLength: Math.random() < 0.5 ? a.rsiLength : b.rsiLength,
        rsiDcaIn: Math.random() < 0.5 ? a.rsiDcaIn : b.rsiDcaIn,
        rsiDcaOut: Math.random() < 0.5 ? a.rsiDcaOut : b.rsiDcaOut,
        buyCondition: Math.random() < 0.5 ? a.buyCondition : b.buyCondition,
    };
}

export const simulateDCA = (rcConfig: DCAConfig, data: { [date: string]: candleType }, isRecommend = false) => {
    const TOTAL_ORDER = rcConfig.totalOrder;
    const PROFIT_PERCENT = rcConfig.profitPercent;
    let openOrder: { [orderId: number]: OrderType } = {};
    let sum = 0;
    let response: ChartCandleType = {}; // This just for render candlestick chart

    const closes = Object.values(data).map((c) => c.Close);
    const rsiValues = calculateRSI(closes, 14);
    const dataValues = Object.values(data);

    for (let i = 0; i < dataValues.length; i++) {
        const hour = dataValues[i];
        const hourRSI = rsiValues[i];

        response[hour.Date] = { candle: hour }; // This just for render candlestick chart
        const orders = Object.values(openOrder).sort((a, b) => a.entryPrice - b.entryPrice);
        const firstOrder = orders[0];
        const averangePrice = orders.reduce((sum, order) => sum + order.entryPrice, 0) / orders.length;

        if ((rcConfig.isRSI && hourRSI < rcConfig.rsiDcaIn && hour.Open > hour.Close) || (!rcConfig.isRSI && hour.Open > hour.Close)) {
            if ((rcConfig.buyCondition === "min" && hour.Close < firstOrder?.entryPrice) || (rcConfig.buyCondition === "avg" && hour.Close < averangePrice) || !firstOrder) {
                // Nghĩ về việc mua nhiều tiền hơn khi giá càng thấp
                // Áp dụng thanh lý nhiều lệnh nếu đủ yêu cầu
                if (Object.keys(openOrder).length < TOTAL_ORDER) {
                    // Mở lệnh
                    const orderId = randomId();
                    openOrder[orderId] = {
                        id: orderId,
                        entryTime: hour.Date,
                        entryPrice: hour.Close,
                        qty: rcConfig.value / hour.Close,
                        isTrigger: true,
                        side: "long",
                        stoplossIdx: 0,
                    };

                    // This just for render candlestick chart
                    response[hour.Date] = {
                        ...response[hour.Date],
                        openOrderSide: "long",
                        openOrder: {
                            id: orderId,
                            entryPrice: hour.Close,
                            qty: rcConfig.value / hour.Close,
                            entryTime: hour.Date,
                        },
                    };
                }
            }
        }
        if (hour.Open < hour.Close) {
            if ((Object.keys(openOrder).length > 0 && rcConfig.isRSI && hourRSI > rcConfig.rsiDcaOut) || (Object.keys(openOrder).length > 0 && !rcConfig.isRSI)) {
                for (const order of orders) {
                    if (((hour.Close - order.entryPrice) * 100) / order.entryPrice >= PROFIT_PERCENT) {
                        // Chốt lệnh
                        delete openOrder[order.id];

                        // This just for render candlestick chart
                        const profit = (hour.Close - order.entryPrice) * order.qty;

                        sum += profit;
                        response[hour.Date] = {
                            ...response[hour.Date],
                            openOrderSide: "short",
                            dcaExecutedOrder: [
                                ...(response[hour.Date].dcaExecutedOrder || []),
                                {
                                    id: order.id,
                                    entryPrice: order.entryPrice,
                                    qty: order.qty,
                                    entryTime: order.entryTime,
                                    markPrice: hour.Close,
                                    executedTime: hour.Date,
                                    profit,
                                    stoplossIdx: 0,
                                    isTrigger: false,
                                    side: "long",
                                },
                            ],
                        };
                    }
                }
            }
        }
    }

    if (isRecommend) {
        const openOrders = Object.values(openOrder);
        const openOrderCount = openOrders.length;
        const avgEntryPrice = openOrderCount > 0 ? openOrders.reduce((sum, o) => sum + o.entryPrice, 0) / openOrderCount : 0;

        // Ưu tiên ít lệnh hold nhất
        const weightHold = 1000; // ⚠ Trọng số lớn
        const weightProfit = 1;
        const weightAvgPrice = 0.1;

        // Fitness càng cao càng tốt
        const fitness =
            -weightHold * openOrderCount + // ✅ Trừ mạnh nếu hold nhiều
            weightProfit * sum - // ✅ Lợi nhuận vẫn có ảnh hưởng
            weightAvgPrice * avgEntryPrice; // ✅ Giá trung bình ảnh hưởng nhẹ

        return fitness;
    }

    return response;
};

function calculateRSI(closes: number[], length = 14): number[] {
    const rsi: number[] = [];

    let gains = 0,
        losses = 0;

    for (let i = 1; i <= length; i++) {
        const delta = closes[i] - closes[i - 1];
        if (delta >= 0) gains += delta;
        else losses -= delta;
    }

    let avgGain = gains / length;
    let avgLoss = losses / length;
    rsi[length] = 100 - 100 / (1 + avgGain / avgLoss);

    for (let i = length + 1; i < closes.length; i++) {
        const delta = closes[i] - closes[i - 1];
        const gain = delta > 0 ? delta : 0;
        const loss = delta < 0 ? -delta : 0;

        avgGain = (avgGain * (length - 1) + gain) / length;
        avgLoss = (avgLoss * (length - 1) + loss) / length;

        rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }

    return rsi;
}
