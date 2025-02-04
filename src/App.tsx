import React, { useEffect, useState } from "react";
import styles from "@src/App.module.scss";
import Chart from "./chart";

import HistoryTab from "@src/component/tab/history";
import Config from "@src/component/config";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import default styles
import { fetchTokenData } from "@src/http";
import { useDispatch } from "react-redux";
import { dataActions } from "./redux/dataReducer";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

const App = () => {
    const [chartData, setChartData] = useState();
    const [isFetchData, setIsFetchData] = useState(true);
    const [duration, setDuration] = useState(100);
    const dispatch = useDispatch();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["data"], // Unique key for caching
        queryFn: fetchTokenData, // Function to fetch data
    });

    if (isError) {
        toast.error("Can't fetch data.");
    }

    useEffect(() => {
        if (data && data.status === 200) {
            dispatch(dataActions.fetchData(data.data));
        }
    }, [data, dispatch]);

    return (
        <div className={styles.wrapper}>
            {isLoading && (
                <div className={styles.loading}>
                    <div className={styles.content}>
                        <FontAwesomeIcon icon={faRotate} className={styles.loadingIcon} />
                        Fetching data ...
                    </div>
                </div>
            )}
            <ToastContainer position="top-center" autoClose={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable={false} theme="light" transition={Bounce} />
            <div className={styles.configAndChart}>
                <Config />
                <div className={styles.chart}>
                    <header className={styles.frameHeader}>Live chart</header>
                    <Chart data={chartData ? chartData.data : {}} setIsFetchData={setIsFetchData} duration={duration} />
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
};

export default App;
