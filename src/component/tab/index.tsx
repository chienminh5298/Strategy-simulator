import React, { useState } from "react";
import styles from "@src/App.module.scss";
import HistoryTab from "@src/component/tab/history";

const Tab = () => {
    const [tab, setTab] = useState("history");

    return (
        <div className={styles.board}>
            <header className={styles.frameHeader}>
                <label className={styles.option}>
                    <input type="radio" name="tab" value="history" defaultChecked />
                    <span>History</span>
                </label>
                <label className={styles.option}>
                    <input type="radio" name="tab" value="analyse" />
                    <span>Analyse</span>
                </label>
            </header>
            <div>
                <HistoryTab />
            </div>
        </div>
    );
};

export default Tab;
