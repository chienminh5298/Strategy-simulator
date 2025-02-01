import React from "react";
import { ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
import styles from "@src/App.module.scss";
// import { useDispatch } from "react-redux";

type ChartPropType = {
    data: dateDataType;
    setIsFetchData: React.Dispatch<React.SetStateAction<boolean>>;
    isFetchData: boolean;
    duration: number;
};

type dateType = {
    candle: {
        open: number;
        high: number;
        low: number;
        close: number;
    };
    openOrders: openOrder[];
    executeOrders: executeOrder[];
    moveOrders: openOrder[];
};

type dateDataType = {
    [date: string]: dateType;
};

type openOrder = {
    orderId: string;
    qty: number;
    buyPrice: number;
    date: Date;
    side: "BUY" | "SELL";
    stopPrice: number;
    hitPrice: number | null;
    rootOrderId: string;
};

type executeOrder = {
    orderId: string;
    openDate: Date;
    executeDate: Date;
    side: "BUY" | "SELL";
    profit: number;
};

const Chart = ({ data, setIsFetchData, duration }: ChartPropType) => {
    // const dispatch = useDispatch();

    const chartContainerRef = useRef<HTMLDivElement>(null);
    console.log(chartContainerRef.current?.clientHeight);
    useEffect(() => {
        const price_data = data ? data : {};
        if (!chartContainerRef.current) {
            return;
        }

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current?.clientWidth, // Default width
            height: chartContainerRef.current?.clientHeight, // Default height
            layout: {
                textColor: "rgba(255, 255, 255, 1)",
                background: { type: ColorType.Solid, color: "#11100f" },
            },
            grid: {
                vertLines: {
                    color: "#334158",
                },
                horzLines: {
                    color: "#334158",
                },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            timeScale: {
                barSpacing: 20,
                fixLeftEdge: true,
                fixRightEdge: true,
                timeVisible: true,
                secondsVisible: false,
            },
            handleScale: {
                axisPressedMouseMove: { time: true, price: false }, // Disable vertical scaling
            },
            localization: {
                dateFormat: "yyyy-MM-dd", // English date format
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

        // update lable time
        const lineSeries = chart.addLineSeries();
        let intervalID: any;
        if (Object.keys(price_data).length !== 0) {
            const ddd = Object.keys(price_data).map((key) => {
                const temp = price_data[key];
                return {
                    time: Math.floor(new Date(key).getTime() / 1000), // Convert to Unix timestamp in seconds
                    open: temp.candle.open,
                    high: temp.candle.high,
                    low: temp.candle.low,
                    close: temp.candle.close,
                    openOrders: temp.openOrders,
                    executeOrders: temp.executeOrders,
                    moveOrders: temp.moveOrders,
                };
            });

            const line_data: any[] = Object.keys(price_data).map((key) => {
                return {
                    time: Math.floor(new Date(key).getTime() / 1000),
                };
            });

            lineSeries.setData(line_data);

            // simulate real-time data
            function* getNextRealtimeUpdate(realtimeData: any) {
                for (const dataPoint of realtimeData) {
                    yield dataPoint;
                }
                return null;
            }
            const streamingDataProvider = getNextRealtimeUpdate(ddd);
            const nnnn: any[] = [];

            intervalID = setInterval(() => {
                const update = streamingDataProvider.next();
                const dateData = update.value;
                if (update.done) {
                    clearInterval(intervalID);
                    return;
                }

                let text = "";
                if (dateData.openOrders.length !== 0) {
                    text = dateData.openOrders[0].side;
                }

                let shape = "";
                if (text === "SELL") shape = "arrowDown";
                if (text === "BUY") shape = "arrowUp";

                nnnn.push({
                    time: dateData.time,
                    position: text === "SELL" ? "aboveBar" : "belowBar",
                    color: text === "SELL" ? "#ef476f" : "#06d6a0",
                    shape,
                    text,
                });

                candleSeries.setMarkers(nnnn);
                candleSeries.update(dateData);

                // Update backtest store
                // dispatch(backtestAction.updateClosePrice(dateData.close));
                // dispatch(backtestAction.updateDate(dateData));

                chart.timeScale().scrollToPosition(nnnn.length, false);
            }, duration);

            setTimeout(() => {
                setIsFetchData(false);
            }, Object.keys(price_data).length * duration);
        }
        return () => {
            chart.remove();
            clearInterval(intervalID);
        };
    }, [data]);

    return <div ref={chartContainerRef} className={styles.chartContainer} />;
};

export default Chart;
