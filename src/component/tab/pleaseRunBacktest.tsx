import React from "react";
import styles from "@src/App.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const PleaseRunBacktest = () => {
    return (
        <div className={styles.pleaseRunBacktest}>
            <p>Don't have data, please run backtest. Or wait for backtest done.</p>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.icon} />
        </div>
    );
};

export default PleaseRunBacktest;
