import React, { useEffect, useRef } from "react";
import { ColorType, createChart } from "lightweight-charts";
import styles from "@src/App.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { configActions } from "../redux/configReducer";
import { chartActions } from "../redux/chartReducer";

const Chart = () => {
    const dispatch = useDispatch();
    const { data, duration } = useSelector((state: RootState) => state.chart);
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

        // Optional line series for additional data (e.g., labels)
        const lineSeries = chart.addLineSeries();

        let intervalID: any;
        if (Object.keys(data).length !== 0) {
            // Transform the data object into an array of candles
            const ddd = Object.keys(data).map((key) => {
                const temp = data[key];
                return {
                    time: Math.floor(new Date(key).getTime() / 1000),
                    open: temp.candle.Open,
                    high: temp.candle.High,
                    low: temp.candle.Low,
                    close: temp.candle.Close,
                    openOrderSide: temp.openOrderSide,
                    executedOrder: temp.executedOrder,
                };
            });

            // Set up a static line series data if needed
            const line_data = Object.keys(data).map((key) => ({
                time: Math.floor(new Date(key).getTime() / 1000),
            }));
            lineSeries.setData(line_data);

            // Generator to simulate real-time data updates
            function* getNextRealtimeUpdate(realtimeData: any) {
                for (const dataPoint of realtimeData) {
                    yield dataPoint;
                }
                return null;
            }
            const streamingDataProvider = getNextRealtimeUpdate(ddd);

            // Maintain a bounded list of markers
            const markers: any[] = [];

            intervalID = setInterval(() => {
                const update = streamingDataProvider.next();
                const dateData = update.value;
                if (dateData !== null && dateData.executedOrder) {
                    dispatch(chartActions.updateHistory(dateData.executedOrder));
                }
                if (update.done) {
                    clearInterval(intervalID);
                    dispatch(configActions.updateIsBacktestRunning(false));
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

                // Update the candlestick with the new data
                candleSeries.update({
                    time: dateData.time,
                    open: dateData.open,
                    high: dateData.high,
                    low: dateData.low,
                    close: dateData.close,
                    ...(text !== "" ? { borderColor, borderWidth: 20 } : {}),
                });

                // Only add and update markers when an order is present
                if (text === "SHORT" || text === "LONG") {
                    markers.push({
                        time: dateData.time,
                        position: text === "SHORT" ? "aboveBar" : "belowBar",
                        color: text === "SHORT" ? "#ef476f" : "#06d6a0",
                        shape,
                        text,
                        size: 2,
                    });
                    candleSeries.setMarkers(markers);
                }

                // Instead of calculating based on marker count, use real-time scrolling
                chart.timeScale().scrollToPosition(markers.length, false)
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
