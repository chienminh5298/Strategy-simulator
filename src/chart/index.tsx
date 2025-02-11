import React from "react";
import { ColorType, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
import styles from "@src/App.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Chart = () => {
    // const dispatch = useDispatch();

    const { data, duration } = useSelector((state: RootState) => state.chart);

    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
            timeScale: {
                barSpacing: 10,
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
        if (Object.keys(data).length !== 0) {
            const ddd = Object.keys(data).map((key) => {
                const temp = data[key];
                return {
                    time: Math.floor(new Date(key).getTime() / 1000), // Convert to Unix timestamp in seconds
                    open: temp.candle.Open,
                    high: temp.candle.High,
                    low: temp.candle.Low,
                    close: temp.candle.Close,
                    openOrderSide: temp.openOrderSide,
                    executedOrder: temp.executedOrder,
                };
            });

            const line_data: any[] = Object.keys(data).map((key) => {
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
                let borderColor = "";
                let shape = "";

                if (dateData.openOrderSide) {
                    text = dateData.openOrderSide.toUpperCase();
                }

                if (text === "SHORT") {
                    shape = "arrowDown";
                    borderColor = "#0032ff";
                }
                if (text === "LONG") {
                    shape = "arrowUp";
                    borderColor = "#0032ff";
                }

                nnnn.push({
                    time: dateData.time,
                    position: text === "SHORT" ? "aboveBar" : "belowBar",
                    color: text === "SHORT" ? "#ef476f" : "#06d6a0",
                    shape,
                    text,
                    size: 2,
                });

                candleSeries.update({
                    time: dateData.time,
                    open: dateData.open,
                    high: dateData.high,
                    low: dateData.low,
                    close: dateData.close,
                    ...(borderColor !== "" ? { borderColor, borderWidth: 20 } : {}),
                });
                candleSeries.setMarkers(nnnn);
                // candleSeries.update(dateData);

                chart.timeScale().scrollToPosition(nnnn.length, false);
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
