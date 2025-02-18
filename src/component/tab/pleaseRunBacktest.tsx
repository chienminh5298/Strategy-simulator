import React from "react";
import styles from "@src/App.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const PleaseRunBacktest = () => {
    return (
        <div className={styles.pleaseRunBacktest}>
            <p>Don't have data. Please run backtest.</p>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.icon} />
        </div>
    );
};

export default PleaseRunBacktest;
