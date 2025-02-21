import { faArrowRight, faGamepad, faRotate, faWarning } from "@fortawesome/free-solid-svg-icons";
import helpStyles from "@src/component/needHelp/index.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { candleType, dataActions } from "@src/redux/dataReducer";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { needHelpActions } from "@src/redux/needHelpReducer";
import { backtestLogic } from "@src/utils/backtestLogic";
import { chartActions } from "@src/redux/chartReducer";
import { configActions } from "@src/redux/configReducer";
import { useDispatch, useSelector } from "react-redux";
import { Fragment, useEffect, useState } from "react";
import { processDataForAnalyse } from "@src/utils";
import { useQuery } from "@tanstack/react-query";
import NeedHelp from "@src/component/needHelp";
import "react-toastify/dist/ReactToastify.css";
import { RootState } from "@src/redux/store";
import styles from "@src/App.module.scss";
import Config from "@src/component/config";
import { fetchToken } from "@src/http";
import Tab from "@src/component/tab";
import Chart from "@src/chart";

const App = () => {
    const { isConfigCorrect, config, isBacktestRunning } = useSelector((state: RootState) => state.config);
    const dataStore = useSelector((state: RootState) => state.data);
    const [rawData, setRawData] = useState<{ [data: string]: candleType }>({});
    const { isShowNeedHelp, step } = useSelector((state: RootState) => state.needHelp);

    useEffect(() => {
        if (isConfigCorrect) {
            setRawData(dataStore[config.token][parseInt(config.year)]);
        }
    }, [isConfigCorrect, dataStore, config]);

    const [isFetchData, setIsFetchData] = useState(false);
    const dispatch = useDispatch();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["token"], // Unique key for caching
        queryFn: fetchToken, // Function to fetch data
    });

    useEffect(() => {
        if (isError) {
            toast.error("Can't fetch data.");
        }
        setIsFetchData(!isFetchData);
        if (isFetchData) {
            dispatch(needHelpActions.showNeedHelp());
        }
    }, [isError, isLoading]);

    useEffect(() => {
        if (data && data.status === 200) {
            dispatch(dataActions.fetchToken(data.data));
        }
    }, [data, dispatch]);

    // Handle run backtest
    const handleRun = () => {
        if (isConfigCorrect) {
            const chartData = backtestLogic(rawData, config);
            let executedOrders = Object.values(chartData)
                .filter((order) => order.executedOrder !== undefined)
                .map((order) => order.executedOrder!);
            const analyseData = processDataForAnalyse(executedOrders, config);
            dispatch(chartActions.resetState()); // Reset before run a new backtest
            dispatch(chartActions.updateData({ data: chartData, analyse: analyseData }));
            dispatch(configActions.updateIsBacktestRunning(true));
            dispatch(configActions.updateRecordConfig({ config, profitPercent: analyseData.overView.profitPercent }));
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
                {isShowNeedHelp && (
                    <Fragment>
                        {step === 0 && (
                            <div className={`${helpStyles.helpContainer} ${helpStyles.welcomeBoard}`}>
                                <div className={helpStyles.welcomeTitle}>
                                    <FontAwesomeIcon icon={faGamepad} className={helpStyles.icon} />
                                    <h2>* Strategy simulator *</h2>
                                </div>
                                <div className={helpStyles.content}>
                                    <span>Welcome to the Strategy Simulator! 🚀 Test, optimize, and refine your trading strategies with ease.</span>
                                    <span>This system is designed for scalping trades, collecting real-time data from Binance.com and using 5-minute candlestick charts for backtesting. However, to save your time, the chart displays 15-minute candlesticks instead. The system achieves an accuracy rate of up to 90%. Processing a full year of data takes approximately 3 minutes and 30 seconds, so please be patient while the backtest completes.</span>
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
                            <div className={styles.nextButton} onClick={() => dispatch(needHelpActions.updateStep())}>
                                <span>Next</span>
                                <FontAwesomeIcon icon={faArrowRight} />
                            </div>
                        </div>
                    </Fragment>
                )}

                {isFetchData && (
                    <div className={styles.loading}>
                        <div className={styles.content}>
                            <FontAwesomeIcon icon={faRotate} className={styles.loadingIcon} />
                            Fetching data ...
                        </div>
                    </div>
                )}
                <ToastContainer position="top-center" autoClose={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable={false} theme="light" transition={Bounce} />
                <div className={styles.configAndChart}>
                    <Config setIsFetchData={setIsFetchData} />
                    <div className={styles.chart}>
                        <header className={styles.frameHeader}>Live chart</header>
                        <div className={styles.container}>
                            <div className={styles.buttonContainer}>
                                {isShowNeedHelp && step === 3 && (
                                    <NeedHelp position="bottom-left">
                                        <div className={helpStyles.helpBox}>
                                            <div className={helpStyles.helpRunButton}>After apply config, press button to run!</div>
                                        </div>
                                    </NeedHelp>
                                )}
                                <div className={styles.buttonWrapper}>
                                    <button className={styles.runButton} disabled={!isConfigCorrect || isBacktestRunning} onClick={handleRun}>
                                        Run backtest
                                    </button>
                                </div>
                            </div>
                            <Chart />
                        </div>
                    </div>
                </div>
                <Tab />
            </div>
        </Fragment>
    );
};

export default App;
