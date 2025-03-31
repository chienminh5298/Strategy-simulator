import React, { useEffect, useRef } from "react";
import { ColorType, createChart } from "lightweight-charts";
import styles from "@src/App.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { dcaActions } from "../redux/dcaReducer";
import { chartDCAActions } from "@src/redux/chartDCAReducer";

const Chart = () => {
    const dispatch = useDispatch();
    const { data, duration } = useSelector((state: RootState) => state.chartDCA);
    const DCAconfig = useSelector((state: RootState) => state.dca);
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                textColor: "rgba(255, 255, 255, 1)",
                background: { type: ColorType.Solid, color: "#11100f" },
            },
            grid: {
                vertLines: { color: "#334158" },
                horzLines: { color: "#334158" },
            },
            timeScale: {
                barSpacing: 10,
                fixLeftEdge: true,
                fixRightEdge: true,
                timeVisible: true,
                secondsVisible: false,
            },
            handleScale: {
                axisPressedMouseMove: { time: true, price: false },
            },
            localization: {
                dateFormat: "yyyy-MM-dd",
                locale: "en-US",
            },
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: "#4bffb5",
            downColor: "#ff4976",
            borderDownColor: "#ff4976",
            borderUpColor: "#4bffb5",
            wickDownColor: "#838ca1",
            wickUpColor: "#838ca1",
        });

        // Volume series at the bottom with transparent colors
        const volumeSeries = chart.addHistogramSeries({
            priceScaleId: "volume", // Separate price scale for volume
            priceFormat: { type: "volume" },
        });

        const lineSeries = chart.addLineSeries();

        let intervalID: any;
        if (Object.keys(data).length !== 0) {
            const ddd = Object.keys(data).map((key) => {
                const temp = data[key];
                return {
                    time: Math.floor(new Date(key).getTime() / 1000),
                    open: temp.candle.Open,
                    high: temp.candle.High,
                    low: temp.candle.Low,
                    close: temp.candle.Close,
                    volume: temp.candle.Volume,
                    openOrderSide: temp.openOrderSide,
                    dcaExecutedOrder: temp.dcaExecutedOrder,
                    openOrder: temp.openOrder,
                    date: key.split("T")[0],
                };
            });

            const line_data = ddd.map(({ time }) => ({ time }));
            lineSeries.setData(line_data);

            function* getNextRealtimeUpdate(realtimeData: any) {
                for (const dataPoint of realtimeData) {
                    yield dataPoint;
                }
                return null;
            }
            const streamingDataProvider = getNextRealtimeUpdate(ddd);
            const markers: any[] = [];

            // Analyse data
            let basket: { [orderId: string]: { qty: number } } = {};
            let history: any[] = [];
            let maxRealLossPL = 0;
            let maxRealProfitPL = 0;
            let currentPrice = 0;
            let historyPL = 0;
            let maxOrder = 0;

            intervalID = setInterval(() => {
                const update = streamingDataProvider.next();
                const dateData = update.value;
                if (dateData !== null) {
                    currentPrice = dateData.close;

                    const { lossPL, profitPL } = updateRealPL({ lossPL: maxRealLossPL, profitPL: maxRealProfitPL, basket, currentPrice, value: DCAconfig.value, historyPL }); // For analyse
                    maxRealLossPL = lossPL; // For analyse
                    maxRealProfitPL = profitPL; // For analyse

                    if (dateData.dcaExecutedOrder) {
                        history = [...history, ...dateData.dcaExecutedOrder]; // For analyse
                        historyPL = history.reduce((total, o) => o.profit + total, 0); // For analyse

                        for (const o of dateData.dcaExecutedOrder) {
                            delete basket[o.id];
                        }

                        dispatch(chartDCAActions.updateHistory(dateData.dcaExecutedOrder));
                        dispatch(chartDCAActions.removeOpenOrder(dateData.dcaExecutedOrder));
                    }
                    if (dateData.openOrder) {
                        const openOrder = dateData.openOrder;
                        basket[openOrder.id] = openOrder;

                        if (Object.keys(basket).length > maxOrder) maxOrder = Object.keys(basket).length;

                        dispatch(chartDCAActions.addOpenOrder(openOrder));
                    }
                    dispatch(chartDCAActions.updateCurrentPrice({ currentPrice, orgBasketValue: Object.keys(basket).length * DCAconfig.value, date: dateData.date }));
                    dispatch(chartDCAActions.updateAnalyse({ maxRealLossPL, maxRealProfitPL, maxOrder })); // For analyse
                }
                if (update.done) {
                    clearInterval(intervalID);
                    dispatch(dcaActions.updateIsBacktestRunning(false));
                    return;
                }

                let text = "";
                let borderColor = "#e4ff00";
                let shape = "";

                if (dateData.openOrderSide) {
                    text = dateData.openOrderSide.toUpperCase();
                }
                if (text === "SHORT") {
                    shape = "arrowDown";
                } else if (text === "LONG") {
                    shape = "arrowUp";
                }

                candleSeries.update({
                    time: dateData.time,
                    open: dateData.open,
                    high: dateData.high,
                    low: dateData.low,
                    close: dateData.close,
                    ...(text !== "" ? { borderColor, borderWidth: 20 } : {}),
                });

                // Volume series update with transparency
                volumeSeries.update({
                    time: dateData.time,
                    value: dateData.volume,
                    color: dateData.close > dateData.open ? "rgba(38, 166, 154, 0.2)" : "rgba(239, 71, 111, 0.2)", // Transparent green & red
                });

                if (text === "SHORT" || text === "LONG") {
                    markers.push({
                        time: dateData.time,
                        position: text === "SHORT" ? "aboveBar" : "belowBar",
                        color: text === "SHORT" ? "#ef476f" : "#06d6a0",
                        shape,
                        text: text === "SHORT" ? "S" : "B",
                        size: 2,
                    });
                    candleSeries.setMarkers(markers);
                }

                chart.timeScale().scrollToPosition(markers.length, false);
            }, duration);
        }

        return () => {
            chart.remove();
            clearInterval(intervalID);
        };
    }, [data]);

    return <div ref={chartContainerRef} className={styles.chartContainer} />;
};

export default Chart;

type UpdateRealPLType = {
    lossPL: number;
    profitPL: number;
    basket: { [orderId: string]: { qty: number } };
    currentPrice: number;
    value: number;
    historyPL: number;
};
const updateRealPL = ({ lossPL, profitPL, basket, currentPrice, value, historyPL }: UpdateRealPLType) => {
    const oriValue = Object.values(basket).length * value;
    const basketValue = Object.values(basket).reduce((total, o) => total + o.qty, 0) * currentPrice;
    const realPL = historyPL + basketValue - oriValue;
    if (realPL > profitPL) {
        profitPL = realPL;
    }
    if (realPL < lossPL) {
        lossPL = realPL;
    }

    return { lossPL, profitPL };
};
