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

let openOrder: { [orderId: number]: OrderType } = {};
let executedOrder: Required<OrderType>[] = [];

export const backtestLogic = (data: candleType[], config: configType) => {
    for (const candle of data) {
        checkHitStoploss(candle, config);

        
    }
};

const checkIsMidNight = (UTCstring: string) => {
    const date = new Date(UTCstring);
    return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
};

const checkExecuteOrder = (candle: candleType, config: configType) => {
    for (let order in openOrder) {
    }
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

const closeOrder = (order: OrderType, markPrice: number, candle: candleType) => {
    if (openOrder[order.id]) {
        const profit = getProfit({ qty: order.qty, side: order.side, markPrice, entryPrice: order.entryPrice });
        const tempOrder = { ...openOrder[order.id], markPrice, executedTime: candle.Date, profit };
        delete openOrder[order.id];
        executedOrder.push(tempOrder);
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
