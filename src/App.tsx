import React, { Fragment, useEffect, useState } from "react";
import styles from "@src/App.module.scss";
import Chart from "./chart";

import HistoryTab from "@src/component/tab/history";
import Config from "@src/component/config";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import default styles
import { fetchTokenData } from "@src/http";
import { useDispatch } from "react-redux";
import { candleType, dataActions } from "@src/redux/dataReducer";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import { backtestLogic } from "./utils/backtestLogic";
import { chartActions } from "./redux/chartReducer";

const App = () => {
    const isConfigCorrect = useSelector((state: RootState) => state.config.isConfigCorrect);
    const config = useSelector((state: RootState) => state.config.config);
    const dataStore = useSelector((state: RootState) => state.data);
    const [rawData, setRawData] = useState<candleType[]>([]);

    useEffect(() => {
        if (isConfigCorrect) {
            setRawData(dataStore[config.token][parseInt(config.year)]);
        }
    }, [isConfigCorrect]);

    const [isFetchData, setIsFetchData] = useState(false);
    const [duration, setDuration] = useState(100);
    const dispatch = useDispatch();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["data"], // Unique key for caching
        queryFn: fetchTokenData, // Function to fetch data
    });

    useEffect(() => {
        if (isError) {
            toast.error("Can't fetch data.");
        }
        setIsFetchData(!isFetchData);
    }, [isError, isLoading]);

    useEffect(() => {
        if (data && data.status === 200) {
            dispatch(dataActions.fetchData(data.data));
        }
    }, [data, dispatch]);

    // Handle run backtest
    const handleRun = () => {
        if (isConfigCorrect) {
            const chartData = backtestLogic(rawData, config);
            dispatch(chartActions.updateData(chartData));
        }
    };

    return (
        <div className={styles.wrapper}>
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
                        <button className={styles.runButton} disabled={!isConfigCorrect} onClick={handleRun}>
                            Run backtest
                        </button>
                        <Chart setIsFetchData={setIsFetchData} duration={duration} />
                    </div>
                </div>
            </div>
            <div className={styles.board}>
                <header className={styles.frameHeader}>
                    <label className={styles.option}>
                        <input type="radio" name="tab" value="long" />
                        <span>History</span>
                    </label>
                    <label className={styles.option}>
                        <input type="radio" name="tab" value="short" defaultChecked />
                        <span>Analyse</span>
                    </label>
                </header>
                <div>
                    <HistoryTab />
                </div>
            </div>
        </div>
    );
    return <Fragment></Fragment>;
};

export default App;
