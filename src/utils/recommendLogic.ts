import { checkIsNewCandle, getDayColor, getMarkPRice, getProfit, OrderType, randomId } from "@src/utils/backtestLogic";
import { configType, StoplossType } from "@src/component/config/customize";
import { RecommendConfigType } from "@src/redux/configReducer";
import { candleType } from "@src/redux/dataReducer";

let stoplossOptions = [0]; // Initialize with a default value
let entryLossPercents = [0]; // Initialize with a default value

// Use genetic algorithm to find the best config for the given data
export const recommendLogic = (rcConfig: RecommendConfigType, data: { [date: string]: candleType }) => {
    const POP_SIZE = 40;
    const GENERATIONS = 10;

    stoplossOptions = generateStoploss(rcConfig.maxLossPercent);
    entryLossPercents = stoplossOptions.filter((p) => p < 0);

    let population: Individual[] = Array.from({ length: POP_SIZE }, () => {
        const config = randomConfig(rcConfig);
        return {
            config,
            fitness: simulate({ data, rcConfig: config }),
        };
    });

    for (let gen = 0; gen < GENERATIONS; gen++) {
        population.sort((a, b) => b.fitness - a.fitness);
        const parents = population.slice(0, 2); // Select the top 2 individuals as parents
        const newPopulation: Individual[] = [...parents];

        while (newPopulation.length < POP_SIZE) {
            const childConfig = mutateConfig(crossoverConfig(parents[0].config, parents[1].config));
            const fitness = simulate({ data, rcConfig: childConfig });
            newPopulation.push({ config: childConfig, fitness });
        }

        population = newPopulation;
    }

    const best = population.reduce((best, current) => (current.fitness > best.fitness ? current : best));
    return best.config;
};

// This function will mutate the config with a small chance to change some of its properties
// It helps to explore the solution space and avoid local optima
function mutateConfig(config: configType): configType {
    const mutated = JSON.parse(JSON.stringify(config));

    if (Math.random() < 0.3) mutated.setting.closeOrderBeforeNewCandle = !mutated.setting.closeOrderBeforeNewCandle;
    if (Math.random() < 0.3) mutated.setting.isTrigger = !mutated.setting.isTrigger;
    if (Math.random() < 0.3) mutated.strategy.stoplosses = randomTargets(config.strategy.stoplosses.length);
    if (Math.random() < 0.3) mutated.triggerStrategy.stoplosses = randomTargets(config.triggerStrategy.stoplosses.length);

    return mutated;
}

// This function will crossover two parents' targets to create a child target
function crossoverTargets(aTargets: StoplossType[], bTargets: StoplossType[]): StoplossType[] {
    const length = aTargets.length;
    const childTargets: StoplossType[] = [];

    for (let i = 0; i < length; i++) {
        let sl: number, tp: number;
        const useAverage = Math.random() < 0.5;

        if (useAverage) {
            sl = Math.round((aTargets[i].percent + bTargets[i].percent) * 50) / 100;
            tp = Math.round((aTargets[i].target + bTargets[i].target) * 50) / 100;
        } else {
            const pickFrom = Math.random() < 0.5 ? aTargets : bTargets;
            sl = pickFrom[i].percent;
            tp = pickFrom[i].target;
        }

        if (sl > tp) sl = tp;
        childTargets.push({ percent: sl, target: tp });
    }

    for (let i = 1; i < childTargets.length; i++) {
        if (childTargets[i].target <= childTargets[i - 1].target) {
            childTargets[i].target = parseFloat((childTargets[i - 1].target + 0.2).toFixed(2));
        }
        if (childTargets[i].percent > childTargets[i].target) {
            childTargets[i].percent = childTargets[i].target;
        }
    }

    // Đảm bảo phần tử cuối cùng có percent = target nếu cần
    const last = childTargets[childTargets.length - 1];
    if (last.percent !== last.target) {
        last.percent = last.target;
    }

    childTargets[0] = { target: 0, percent: randomPick(entryLossPercents) };
    return childTargets;
}

function crossoverConfig(a: configType, b: configType): configType {
    return {
        token: a.token,
        year: a.year,
        value: a.value,
        setting: {
            timeFrame: a.setting.timeFrame,
            closeOrderBeforeNewCandle: Math.random() < 0.5 ? a.setting.closeOrderBeforeNewCandle : b.setting.closeOrderBeforeNewCandle,
            isTrigger: Math.random() < 0.5 ? a.setting.isTrigger : b.setting.isTrigger,
        },
        strategy: {
            direction: Math.random() < 0.5 ? a.strategy.direction : b.strategy.direction,
            stoplosses: crossoverTargets(a.strategy.stoplosses, b.strategy.stoplosses),
        },
        triggerStrategy: {
            direction: Math.random() < 0.5 ? a.triggerStrategy.direction : b.triggerStrategy.direction,
            stoplosses: crossoverTargets(a.triggerStrategy.stoplosses, b.triggerStrategy.stoplosses),
        },
    };
}

const getNewOrderSide = (prevDayCandleColor: "green" | "red", direction: "same" | "opposite") => {
    if (direction === "same") {
        if (prevDayCandleColor === "green") return "long";
        else return "short";
    } else {
        if (prevDayCandleColor === "green") return "short";
        return "long";
    }
};

// This function will sum total loss everytime price hit stoploss
type GetStoplossValueType = {
    data: { [date: string]: candleType };
    rcConfig: configType;
};

function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

type Individual = {
    config: configType;
    fitness: number;
};

const generateTarget = () => {
    let targets: number[] = [];
    for (let i = 0.2; i <= 5; i += 0.2) {
        targets.push(parseFloat(i.toFixed(2)));
    }
    return targets;
};

const generateStoploss = (min: number) => {
    let stoplosses: number[] = [];
    for (let i = min; i <= 5; i += 0.2) {
        stoplosses.push(parseFloat(i.toFixed(2)));
    }
    return stoplosses;
};

const targetOptions = generateTarget();
const keepOverNightOptions = [true, false];
const isTriggerOptions = [true, false];
const directionOptions = ["same", "opposite"];

function randomTargets(numTargets: number): StoplossType[] {
    const targets: StoplossType[] = [
        { target: 0, percent: randomPick(entryLossPercents) }, // Entry point
    ];

    let lastTarget = 0;
    let lastPercent = targets[0].percent;

    for (let i = 1; i < numTargets; i++) {
        let tp: number = 0;
        let sl: number = 0;

        while (true) {
            // ✅ Filter target options tăng dần và loại target lớn nhất nếu không phải target cuối cùng
            const tpOptions = targetOptions.filter((t) => {
                const notTooLow = t > lastTarget;
                const notMaxIfNotFinal = i === numTargets - 1 || t < targetOptions[targetOptions.length - 1];
                return notTooLow && notMaxIfNotFinal;
            });

            if (tpOptions.length === 0) break; // fallback thoát sớm

            tp = randomPick(tpOptions);

            if (i === numTargets - 1) {
                // ✅ Target cuối cùng → stoploss = target
                sl = tp;
                break;
            } else {
                // ✅ Chọn stoploss > lastPercent và <= tp
                const slOptions = stoplossOptions.filter((s) => s <= tp && s > lastPercent);

                if (slOptions.length > 0) {
                    sl = randomPick(slOptions);
                    break;
                }
                // ❌ Nếu không có stoploss hợp lệ → chọn lại tp
            }
        }

        targets.push({ target: tp, percent: sl });
        lastTarget = tp;
        lastPercent = sl;
    }

    return targets;
}

function randomConfig(rcConfig: RecommendConfigType): configType {
    return {
        token: rcConfig.token,
        year: rcConfig.year,
        value: rcConfig.value,
        setting: {
            timeFrame: rcConfig.setting.timeFrame,
            closeOrderBeforeNewCandle: randomPick(keepOverNightOptions),
            isTrigger: randomPick(isTriggerOptions),
        },
        strategy: {
            direction: randomPick(directionOptions) as "same" | "opposite",
            stoplosses: randomTargets(rcConfig.numOfStrategyTarget),
        },
        triggerStrategy: {
            direction: randomPick(directionOptions) as "same" | "opposite",
            stoplosses: randomTargets(rcConfig.numOfTriggerStrategyTarget),
        },
    };
}

const simulate = ({ data, rcConfig }: GetStoplossValueType) => {
    const dataKey = Object.keys(data);
    const dataValues = Object.values(data);
    let openOrder: { [orderId: number]: OrderType } = {};
    let sum = 0;

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

    const processCreateNewMidNightOrder = (config: configType, candle: candleType) => {
        const prevCandle = getPrevCandle(config, candle);
        const side = getNewOrderSide(getDayColor(prevCandle), rcConfig.strategy.direction);
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
    };

    const closeOrder = (order: OrderType, markPrice: number, candle: candleType) => {
        if (openOrder[order.id]) {
            const profit = getProfit({ qty: order.qty, side: order.side, markPrice, entryPrice: order.entryPrice });
            sum += profit;
            delete openOrder[order.id];
        }
    };

    //========================= Logic start from here ========================= //
    for (let i = 481; i < dataKey.length; i++) {
        const candle = dataValues[i];

        checkHitStoploss(candle, rcConfig);
        checkHitTarget(candle, rcConfig);

        if (checkIsNewCandle(candle.Date, rcConfig.setting.timeFrame)) {
            // Check if exsist open order
            if (Object.keys(openOrder).length > 0) {
                // Check setting is order not keep over night
                if (!rcConfig.setting.closeOrderBeforeNewCandle) {
                    // Close all order
                    for (const orderId in openOrder) {
                        const order = openOrder[orderId];
                        const markPrice = candle.Open; // We close order at mid night => markPrice is open price
                        closeOrder(order, markPrice, candle);
                    }

                    // Create new order
                    processCreateNewMidNightOrder(rcConfig, candle);

                    // Check hit stoploss for new oder just opned (In case hit stoploss at first candle of the day)
                    checkHitStoploss(candle, rcConfig);
                    checkHitTarget(candle, rcConfig);
                } else {
                    // If order keep over night => Do nothing, let order keep running
                }
            } else {
                // Create new order
                processCreateNewMidNightOrder(rcConfig, candle);

                // Check hit stoploss for new oder just opned (In case hit stoploss at first candle of the day)
                checkHitStoploss(candle, rcConfig);
                checkHitTarget(candle, rcConfig);
            }
        }
    }

    return sum;
};
