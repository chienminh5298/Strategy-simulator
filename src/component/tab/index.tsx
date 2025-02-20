import PleaseRunBacktest from "@src/component/tab/pleaseRunBacktest";
import HistoryTab from "@src/component/tab/history/history";
import AnalyseTab from "@src/component/tab/analyse/analyse";
import ConfigsRecord from "@src/component/tab/configRecord";
import React, { useEffect, useState } from "react";
import { RootState } from "@src/redux/store";
import { useSelector } from "react-redux";
import styles from "@src/App.module.scss";

const Tab = () => {
    const [tab, setTab] = useState(<HistoryTab />);
    const [defaultChecked, setDefaultChecked] = useState("history");
    const dataChart = useSelector((state: RootState) => state.chart.data);
    const isBacktestRunning = useSelector((state: RootState) => state.config.isBacktestRunning);

    const handleTab = (tabName: string) => {
        switch (tabName) {
            case "analyse":
            case "record":
                if (Object.keys(dataChart).length === 0 || isBacktestRunning) {
                    setTab(<PleaseRunBacktest />);
                } else if (tabName === "analyse") {
                    setTab(<AnalyseTab />);
                } else {
                    setTab(<ConfigsRecord />);
                }
                setDefaultChecked(tabName);
                break;
            default:
                setTab(<HistoryTab />);
                setDefaultChecked("history");
        }
    };

    useEffect(() => {
        if (Object.keys(dataChart).length === 0) {
            setDefaultChecked("history");
            setTab(<HistoryTab />);
        }
    }, [dataChart]);
    return (
        <div className={styles.board}>
            <header className={styles.frameHeader}>
                <label className={styles.option} onClick={() => handleTab("historyf")}>
                    <input type="radio" name="tab" value="history" checked={defaultChecked === "history"} readOnly />
                    <span>History</span>
                </label>
                <label className={styles.option} onClick={() => handleTab("analyse")}>
                    <input type="radio" name="tab" value="analyse" checked={defaultChecked === "analyse"} readOnly />
                    <span>Analyse</span>
                </label>
                <label className={styles.option} onClick={() => handleTab("record")}>
                    <input type="radio" name="tab" value="record" checked={defaultChecked === "record"} readOnly />
                    <span>Configs record</span>
                </label>
            </header>
            <div>{tab}</div>
        </div>
    );
};

export default Tab;
