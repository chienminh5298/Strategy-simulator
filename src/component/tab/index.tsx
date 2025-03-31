import PleaseRunBacktest from "@src/component/tab/pleaseRunBacktest";
import HistoryTab from "@src/component/tab/history/history";
import DcaHistoryTab from "@src/component/tab/history/dcaHistory";
import AnalyseConfigTab from "@src/component/tab/analyse/analyse";
import AnalyseDCAConfigTab from "@src/component/tab/analyse/analyseDCA";
import ConfigsRecord from "@src/component/tab/configRecord/configRecord";
import DcaRecord from "@src/component/tab/configRecord/dcaRecord";
import React, { useEffect, useState } from "react";
import { RootState } from "@src/redux/store";
import { useSelector } from "react-redux";
import styles from "@src/App.module.scss";

const Tab = () => {
    const dataConfigChart = useSelector((state: RootState) => state.chartConfig.data);
    const dataDCAChart = useSelector((state: RootState) => state.chartDCA.data);
    const isBacktestRunning = useSelector((state: RootState) => state.config.isBacktestRunning);
    const isBacktestDCARunning = useSelector((state: RootState) => state.dca.isBacktestRunning);
    const currentView = useSelector((state: RootState) => state.system.currentView);

    const [tab, setTab] = useState(<DcaHistoryTab />);
    const [defaultChecked, setDefaultChecked] = useState("history");

    useEffect(() => {
        if (defaultChecked === "history") {
            if (currentView === "dca") {
                setTab(<DcaHistoryTab />);
            } else {
                setTab(<HistoryTab />);
            }
        }
    }, [currentView, defaultChecked]);

    const handleTab = (tabName: string) => {
        switch (tabName) {
            case "analyse":
            case "record":
                if (currentView === "customize" || currentView === "recommend") {
                    if (Object.keys(dataConfigChart).length === 0 || isBacktestRunning) {
                        setTab(<PleaseRunBacktest />);
                    } else if (tabName === "analyse") {
                        setTab(<AnalyseConfigTab />);
                    } else {
                        setTab(<ConfigsRecord />);
                    }
                } else {
                    if (Object.keys(dataDCAChart).length === 0 || isBacktestDCARunning) {
                        setTab(<PleaseRunBacktest />);
                    } else if (tabName === "analyse") {
                        setTab(<AnalyseDCAConfigTab />);
                    } else {
                        setTab(<DcaRecord />);
                    }
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
        if (Object.keys(dataConfigChart).length === 0 && currentView !== "dca") {
            setDefaultChecked("history");
            setTab(<HistoryTab />);
        }
    }, [dataConfigChart, currentView]);

    useEffect(() => {
        if (Object.keys(dataDCAChart).length === 0 && currentView === "dca") {
            setDefaultChecked("history");
            setTab(<DcaHistoryTab />);
        }
    }, [dataDCAChart, currentView]);

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
