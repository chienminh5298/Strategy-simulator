import { useDispatch, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css"; // Import default styles
import { useQuery } from "@tanstack/react-query";
import React, { Fragment, useEffect, useState } from "react";
import { Bounce, toast, ToastContainer } from "react-toastify";

import Chart from "@src/chart";
import styles from "@src/App.module.scss";
import helpStyles from "@src/component/needHelp/index.module.scss";
import Config from "@src/component/config";
import { fetchToken } from "@src/http";
import { candleType, dataActions } from "@src/redux/dataReducer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faRotate } from "@fortawesome/free-solid-svg-icons";
import { RootState } from "@src/redux/store";
import { backtestLogic, OrderType } from "@src/utils/backtestLogic";
import { chartActions } from "@src/redux/chartReducer";
import Tab from "@src/component/tab";
import { configActions } from "./redux/configReducer";
import NeedHelp from "@src/component/needHelp";

const App = () => {
    const { isConfigCorrect, config, isBacktestRunning } = useSelector((state: RootState) => state.config);
    const dataStore = useSelector((state: RootState) => state.data);
    const [rawData, setRawData] = useState<{ [data: string]: candleType }>({});

    useEffect(() => {
        if (isConfigCorrect) {
            setRawData(dataStore[config.token][parseInt(config.year)]);
        }
    }, [isConfigCorrect, dataStore]);

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
            dispatch(chartActions.resetState());
            dispatch(configActions.updateIsBacktestRunning(true));
            dispatch(chartActions.updateData({ data: chartData, analyse: executedOrders }));
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.helpContainer}>
                <div className={styles.nextButton}>
                    <span>Next</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                </div>
            </div>
            {/* {isFetchData && (
                <div className={styles.loading}>
                    <div className={styles.content}>
                        <FontAwesomeIcon icon={faRotate} className={styles.loadingIcon} />
                        Fetching data ...
                    </div>
                </div>
            )} */}
            <ToastContainer position="top-center" autoClose={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable={false} theme="light" transition={Bounce} />
            <div className={styles.configAndChart}>
                <Config setIsFetchData={setIsFetchData} />
                <div className={styles.chart}>
                    <header className={styles.frameHeader}>Live chart</header>
                    <div className={styles.container}>
                        <div className={styles.buttonContainer}>
                            <NeedHelp position="bottom-left">
                                <div className={helpStyles.helpBox}>
                                    <div className={helpStyles.helpRunButton}>After apply config, press button to run!</div>
                                </div>
                            </NeedHelp>
                            <button className={styles.runButton} disabled={!isConfigCorrect || isBacktestRunning} onClick={handleRun}>
                                Run backtest
                            </button>
                        </div>
                        <Chart />
                    </div>
                </div>
            </div>
            <Tab />
        </div>
    );
};

export default App;
