import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faGamepad, faRotate, faWarning } from "@fortawesome/free-solid-svg-icons";

import Tab from "@src/component/tab";
import { fetchToken } from "@src/http";
import ChartDCA from "@src/chart/chartDCA";
import styles from "@src/App.module.scss";
import Dca from "@src/component/config/dca";
import { RootState } from "@src/redux/store";
import NeedHelp from "@src/component/needHelp";
import ChartConfig from "@src/chart/chartConfig";
import { dcaActions } from "@src/redux/dcaReducer";
import { get4hData, getDayData, getHourlyData, processConfigDataForAnalyse } from "@src/utils";

import { simulateDCA } from "@src/utils/dcaLogic";
import { configActions } from "@src/redux/configReducer";
import { systemActions } from "@src/redux/systemReducer";
import { chartDCAActions } from "@src/redux/chartDCAReducer";
import CustomizeConfig from "@src/component/config/customize";
import RecommendConfig from "@src/component/config/recommend";
import { candleType, dataActions } from "@src/redux/dataReducer";
import { chartConfigActions } from "@src/redux/chartConfigReducer";
import helpStyles from "@src/component/needHelp/index.module.scss";
import { backtestLogic, ChartCandleType } from "@src/utils/backtestLogic";

const App = () => {
    const dispatch = useDispatch();

    const dataStore = useSelector((state: RootState) => state.data);
    const currentView = useSelector((state: RootState) => state.system.currentView);
    const isFetchingData = useSelector((state: RootState) => state.system.isLoading);
    const { isConfigCorrect, config, isBacktestRunning } = useSelector((state: RootState) => state.config);
    const dcaConfig = useSelector((state: RootState) => state.dca);
    const { isShowNeedHelpCustomConfig, isShowNeedHelpDCA, stepDCA, stepCustomConfig } = useSelector((state: RootState) => state.system);
    const dcaStore = useSelector((state: RootState) => state.dca);

    const [rawData, setRawData] = useState<{ [data: string]: candleType }>({});

    useEffect(() => {
        if (dataStore[config.token] && !isNaN(parseInt(config.year))) {
            setRawData(dataStore[config.token][parseInt(config.year)]);
        }
        if (dataStore[dcaConfig.token] && !isNaN(parseInt(dcaConfig.year))) {
            setRawData(dataStore[dcaConfig.token][parseInt(dcaConfig.year)]);
        }
    }, [dataStore, config, dcaConfig]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["token"], // Unique key for caching
        queryFn: fetchToken, // Function to fetch data
    });

    useEffect(() => {
        if (isError) {
            toast.error("Can't fetch data.");
        }
        dispatch(systemActions.updateLoading(!isFetchingData));
        if (isFetchingData) {
            // dispatch(systemActions.showNeedHelp({ type: "customize" }));
        }
    }, [isError, isLoading]);

    useEffect(() => {
        if (data && data.status === 200) {
            dispatch(dataActions.fetchToken(data.data));
        }
    }, [data, dispatch]);

    // Handle run backtest
    const handleRun = () => {
        if (currentView === "dca") {
            let data = rawData; // Data 5m
            switch (config.setting.timeFrame) {
                case "1h":
                    data = getHourlyData(rawData);
                    break;
                case "4h":
                    data = get4hData(rawData);
                    break;
                case "1d":
                    data = getDayData(rawData);
                    break;
                default:
                    break;
            }

            if (dcaStore.isConfigCorrect) {
                const chartData = simulateDCA(dcaStore, data) as ChartCandleType;

                dispatch(chartDCAActions.resetState("")); // Reset before run a new backtest
                dispatch(chartDCAActions.updateData({ data: chartData }));

                dispatch(dcaActions.updateIsBacktestRunning(true));
                dispatch(dcaActions.updateRecordHistory(dcaStore));
            } else {
                toast.error("Please apply a config.");
            }
        } else {
            if (isConfigCorrect) {
                const chartData = backtestLogic(rawData, config);
                let executedOrders = Object.values(chartData)
                    .filter((order) => order.executedOrder !== undefined)
                    .map((order) => order.executedOrder!).flat();
                const analyseData = processConfigDataForAnalyse(executedOrders, config);

                dispatch(chartConfigActions.resetState("")); // Reset before run a new backtest
                dispatch(chartConfigActions.updateData({ data: chartData, analyse: analyseData }));

                dispatch(configActions.updateIsBacktestRunning(true));
                dispatch(configActions.updateRecordConfig({ config, profitPercent: analyseData.overView.profitPercent }));
            } else {
                toast.error("Please apply a config.");
            }
        }
    };

    // Handle config tab
    let renderView = <Fragment></Fragment>;
    switch (currentView) {
        case "dca":
            renderView = <Dca />;
            break;
        case "recommend":
            renderView = <RecommendConfig />;
            break;
        default:
            renderView = <CustomizeConfig />;
    }

    let renderChart = currentView === "dca" ? <ChartDCA /> : <ChartConfig />;

    const handleConfigTab = (tabName: string) => {
        switch (tabName) {
            case "dca":
                dispatch(systemActions.updateView("dca"));
                dispatch(chartConfigActions.resetState(""));
                break;
            case "recommend":
                dispatch(systemActions.updateView("recommend"));
                dispatch(chartDCAActions.resetState(""));
                break;
            default:
                dispatch(systemActions.updateView("customize"));
                dispatch(chartDCAActions.resetState(""));
        }
    };
    return (
        <Fragment>
            <div className={styles.blockSmallDevice}>
                <div className={styles.blockMess}>
                    <FontAwesomeIcon icon={faWarning} className={styles.icon} />
                    <span>
                        Your device screen is too small. Please use a device with a screen width of at least <strong>1180px</strong> for the best experience.
                    </span>
                </div>
            </div>

            <div className={styles.wrapper}>
                {isShowNeedHelpDCA && (
                    <Fragment>
                        {stepDCA === 0 && (
                            <div className={`${helpStyles.helpContainer} ${helpStyles.welcomeBoard}`}>
                                <div className={helpStyles.welcomeTitle}>
                                    <FontAwesomeIcon icon={faGamepad} className={helpStyles.icon} />
                                    <h2>* Strategy simulator *</h2>
                                </div>
                                <div className={helpStyles.content}>
                                    <span>Welcome to the scalping DCA (Dollar cost averaging) strategy simulator! </span>
                                    <span>Take the guesswork out of investing with our powerful simulator designed to help you visualize and analyze the Dollar-Cost Averaging strategy over time. Whether you're testing different market conditions, investment intervals, or contribution amounts, this tool helps you build smarter, more consistent strategies. Let’s see how steady investments can lead to powerful results—one step at a time. 🚀📈</span>
                                    <span>Happy trading! 🚀</span>
                                </div>
                            </div>
                        )}
                        <div className={styles.helpContainer}>
                            <div className={styles.nextButton} onClick={() => dispatch(systemActions.updateStep({ type: "dca" }))}>
                                <span>Next</span>
                                <FontAwesomeIcon icon={faArrowRight} />
                            </div>
                        </div>
                    </Fragment>
                )}
                {isShowNeedHelpCustomConfig && (
                    <Fragment>
                        {stepCustomConfig === 0 && (
                            <div className={`${helpStyles.helpContainer} ${helpStyles.welcomeBoard}`}>
                                <div className={helpStyles.welcomeTitle}>
                                    <FontAwesomeIcon icon={faGamepad} className={helpStyles.icon} />
                                    <h2>* Strategy simulator *</h2>
                                </div>
                                <div className={helpStyles.content}>
                                    <span>Welcome to the Strategy Simulator! 🚀 Test, optimize, and refine your trading strategies with ease.</span>
                                    <span>This system is designed for scalping trades, collecting real-time data from Binance.com and using 5-minute candlestick charts for backtesting. However, to save your time, the chart displays 1-hours candlesticks instead. The system achieves an accuracy rate of up to 90%. Processing a full year of data takes approximately 3 minutes and 30 seconds, so please be patient while the backtest completes.</span>
                                    <span>
                                        If you find this tool helpful, please consider giving it a ⭐ on GitHub:{" "}
                                        <a target="_blank" href="https://github.com/chienminh5298/strategy-simulator">
                                            [Github URL]
                                        </a>
                                        . Your support helps improve and expand the system!
                                    </span>
                                    <span>Happy trading! 🚀</span>
                                </div>
                            </div>
                        )}
                        <div className={styles.helpContainer}>
                            <div className={styles.nextButton} onClick={() => dispatch(systemActions.updateStep({ type: "config" }))}>
                                <span>Next</span>
                                <FontAwesomeIcon icon={faArrowRight} />
                            </div>
                        </div>
                    </Fragment>
                )}

                {isFetchingData && (
                    <div className={styles.loading}>
                        <div className={styles.content}>
                            <FontAwesomeIcon icon={faRotate} className={styles.loadingIcon} />
                            Fetching data ...
                        </div>
                    </div>
                )}
                <ToastContainer position="top-center" autoClose={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable={false} theme="light" transition={Bounce} />
                <div className={styles.configAndChart}>
                    <div className={styles.configContainer}>
                        <div className={styles.configTab}>
                            <header className={styles.frameHeader}>
                                <label className={styles.option} onClick={() => handleConfigTab("customize")}>
                                    <input type="radio" name="configTab" value="customize" checked={currentView === "customize"} readOnly />
                                    <span>Customize config</span>
                                </label>
                                <label className={styles.option} onClick={() => handleConfigTab("recommend")}>
                                    <input type="radio" name="configTab" value="recommend" checked={currentView === "recommend"} readOnly />
                                    <span>Recommend config</span>
                                </label>
                                <label className={styles.option} onClick={() => handleConfigTab("dca")}>
                                    <input type="radio" name="configTab" value="dca" checked={currentView === "dca"} readOnly />
                                    <span>DCA</span>
                                </label>
                            </header>
                        </div>
                        {renderView}
                    </div>
                    <div className={styles.chart}>
                        <header className={styles.frameHeader}>Live chart</header>
                        <div className={styles.container}>
                            <div className={styles.buttonContainer}>
                                {isShowNeedHelpCustomConfig && stepCustomConfig === 3 && (
                                    <NeedHelp position="bottom-left">
                                        <div className={helpStyles.helpBox}>
                                            <div className={helpStyles.helpRunButton}>After apply config, press button to run!</div>
                                        </div>
                                    </NeedHelp>
                                )}
                                {isShowNeedHelpDCA && stepDCA === 5 && (
                                    <NeedHelp position="bottom-left">
                                        <div className={helpStyles.helpBox}>
                                            <div className={helpStyles.helpRunButton}>Let's run!</div>
                                        </div>
                                    </NeedHelp>
                                )}
                                <div className={styles.buttonWrapper}>
                                    <button className={styles.runButton} disabled={isBacktestRunning || dcaStore.isBacktestRunning} onClick={handleRun}>
                                        Run backtest
                                    </button>
                                </div>
                            </div>
                            {renderChart}
                        </div>
                    </div>
                </div>
                <Tab />
            </div>
        </Fragment>
    );
};

export default App;
