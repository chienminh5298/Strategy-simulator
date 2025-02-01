import React, { useState } from "react";
import styles from "@src/App.module.scss";
import Chart from "./chart";

import HistoryTab from "@src/component/tab/history";
import Config from "@src/component/config";

const App = () => {
    const [chartData, setChartData] = useState();
    const [isFetchData, setIsFetchData] = useState(true);
    const [duration, setDuration] = useState(100);

    return (
        <div className={styles.wrapper}>
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
