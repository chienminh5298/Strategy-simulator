import PleaseRunBacktest from "@src/component/tab/pleaseRunBacktest";
import HistoryTab from "@src/component/tab/history/history";
import DcaHistoryTab from "@src/component/tab/history/dcaHistory";
import AnalyseTab from "@src/component/tab/analyse/analyse";
import ConfigsRecord from "@src/component/tab/configRecord";
import React, { useEffect, useState } from "react";
import { RootState } from "@src/redux/store";
import { useSelector } from "react-redux";
import styles from "@src/App.module.scss";

const Tab = () => {
    const dataChart = useSelector((state: RootState) => state.chartConfig.data);
    const isBacktestRunning = useSelector((state: RootState) => state.config.isBacktestRunning);
    const currentView = useSelector((state: RootState) => state.system.currentView);

    const [tab, setTab] = useState(<DcaHistoryTab />);
    const [defaultChecked, setDefaultChecked] = useState("history");

    useEffect(() => {
        if (defaultChecked === "history") {
            if (currentView === "dca") {
                setTab(<DcaHistoryTab />);
            }else{
                setTab(<HistoryTab />);
            }
        }
    }, [currentView, defaultChecked]);

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
                if (currentView === "dca") {
                    setTab(<DcaHistoryTab />);
                } else {
                    setTab(<HistoryTab />);
                }
                setDefaultChecked("history");
        }
    };

    useEffect(() => {
        if (Object.keys(dataChart).length === 0) {
            setDefaultChecked("history");
            // setTab(<HistoryTab />);
        }
    }, [dataChart]);
    return (
        <div className={styles.board}>
            <header className={styles.frameHeader}>
                <label className={styles.option} onClick={() => handleTab("history")}>
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
