import React, { useEffect, useState } from "react";
import styles from "@src/App.module.scss";
import HistoryTab from "@src/component/tab/history/history";
import AnalyseTab from "@src/component/tab/analyse/analyse";

const Tab = () => {
    const [tab, setTab] = useState(<AnalyseTab />);

    const handleTab = (tabName: string) => {
        switch (tabName) {
            case "analyse":
                setTab(<AnalyseTab />);
                break;
            default:
                setTab(<HistoryTab />);
        }
    };
    return (
        <div className={styles.board}>
            <header className={styles.frameHeader}>
                <label className={styles.option} onClick={() => handleTab("")}>
                    <input type="radio" name="tab" value="history" defaultChecked />
                    <span>History</span>
                </label>
                <label className={styles.option} onClick={() => handleTab("analyse")}>
                    <input type="radio" name="tab" value="analyse" />
                    <span>Analyse</span>
                </label>
            </header>
            <div>{tab}</div>
        </div>
    );
};

export default Tab;
