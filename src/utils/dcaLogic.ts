import { configType } from "../component/config/customize";
import { candleType } from "../redux/dataReducer";
import { DCAConfig } from "../redux/dcaReducer";
import { ChartCandleType, OrderType, randomId } from "./backtestLogic";

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

    const dataHourly = getHourlyData(data);

    let population: Individual[] = Array.from({ length: POP_SIZE }, () => {
        const config = randomConfig(rcConfig);
        return {
            config,
            fitness: simulateDCA(rcConfig, dataHourly, true) as number,
            // fitness đánh giá dựa trên tổng lợi nhuậnn, vậy có nên thêm order left vào tính cùng fitness hay không ?
        };
    });

    for (let gen = 0; gen < GENERATIONS; gen++) {
        population.sort((a, b) => b.fitness - a.fitness);
        const parents = population.slice(0, 2); // Select the top 2 individuals as parents
        const newPopulation: Individual[] = [...parents];

        while (newPopulation.length < POP_SIZE) {
            const childConfig = mutateConfig(crossoverConfig(parents[0].config, parents[1].config));
            const fitness = simulateDCA(rcConfig, dataHourly, true) as number;
            newPopulation.push({ config: childConfig, fitness });
        }

        population = newPopulation;
    }
    const best = population.reduce((best, current) => (current.fitness > best.fitness ? current : best));
    return best.config;

    // simulateDCA(rcConfig, dataHourly);
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
    };
}

function mutateConfig(config: DCAConfig): DCAConfig {
    const mutationRate = 0.3; // 10% chance to mutate each parameter
    return {
        ...config,
        totalOrder: Math.random() < mutationRate ? randomPick(generateArray(10, 100, 10)) : config.totalOrder,
        profitPercent: Math.random() < mutationRate ? randomPick(generateArray(1, 10, 0.2)) : config.profitPercent,
        isRSI: Math.random() < mutationRate ? !config.isRSI : config.isRSI,
        rsiLength: Math.random() < mutationRate ? randomPick(generateArray(5, 24, 1)) : config.rsiLength,
        rsiDcaIn: Math.random() < mutationRate ? randomPick(generateArray(10, 45, 1)) : config.rsiDcaIn,
        rsiDcaOut: Math.random() < mutationRate ? randomPick(generateArray(50, 70, 1)) : config.rsiDcaOut,
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
    };
}

export const simulateDCA = (rcConfig: DCAConfig, dataHourly: { [date: string]: candleType }, isRecommend = false) => {
    const TOTAL_ORDER = rcConfig.totalOrder;
    const PROFIT_PERCENT = rcConfig.profitPercent;
    let openOrder: { [orderId: number]: OrderType } = {};
    let sum = 0;
    let response: ChartCandleType = {}; // This just for render candlestick chart

    const closes = Object.values(dataHourly).map((c) => c.Close);
    const rsiValues = calculateRSI(closes, 14);
    const dataValues = Object.values(dataHourly);

    for (let i = 0; i < dataValues.length; i++) {
        const hour = dataValues[i];
        const hourRSI = rsiValues[i];

        response[hour.Date] = { candle: hour }; // This just for render candlestick chart
        const orders = Object.values(openOrder).sort((a, b) => a.entryPrice - b.entryPrice);
        const firstOrder = orders[0];
        const averangePrice = orders.reduce((sum, order) => sum + order.entryPrice, 0) / orders.length;

        if ((rcConfig.isRSI && hourRSI < rcConfig.rsiDcaIn && hour.Open > hour.Close) || (!rcConfig.isRSI && hour.Open > hour.Close)) {
            // Nếu RSI < 35 hoặc không dùng RSI và giá mở cửa > giá đóng cửa
            // if (hour.Close <= firstOrder?.entryPrice || !firstOrder) {
            if (hour.Close < firstOrder?.entryPrice || !firstOrder) {
                // Chỉ DCA in khi giá thấp hơn giá nhỏ nhất trong basket
                // Thử DCA in khi giá thấp hơn giá trung bình trong basket
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
        // Tính toán fitness
        const weightHold = 10;
        const weightAvgPrice = 0.1;

        const fitness = sum - weightHold * openOrderCount - weightAvgPrice * avgEntryPrice;

        return fitness;
    }
    return response;
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
