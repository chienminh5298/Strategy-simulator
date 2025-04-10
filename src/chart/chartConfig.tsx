import { chartConfigActions } from "@src/redux/chartConfigReducer";
import { ColorType, createChart } from "lightweight-charts";
import { configActions } from "@src/redux/configReducer";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import { RootState } from "@src/redux/store";
import styles from "@src/App.module.scss";

const Chart = () => {
    const dispatch = useDispatch();
    const { data, duration } = useSelector((state: RootState) => state.chartConfig);
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
        const dataKey = Object.keys(data);
        if (dataKey.length !== 0) {
            const ddd = dataKey.map((key) => {
                const temp = data[key];
                return {
                    time: Math.floor(new Date(key).getTime() / 1000),
                    open: temp.candle.Open,
                    high: temp.candle.High,
                    low: temp.candle.Low,
                    close: temp.candle.Close,
                    volume: temp.candle.Volume,
                    openOrderSide: temp.openOrderSide,
                    executedOrder: temp.executedOrder,
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

            intervalID = setInterval(() => {
                const update = streamingDataProvider.next();
                const dateData = update.value;
                if (dateData !== null && dateData.executedOrder) {
                    dispatch(chartConfigActions.updateHistory(dateData.executedOrder));
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
                        text,
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
