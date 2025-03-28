import React, { Fragment, useEffect, useState } from "react";
import styles from "@src/component/tab/history/history.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import { convertToUTCDateTime, toUSD } from "@src/utils";

const HistoryTab = () => {
    const visibleItems = useSelector((state: RootState) => state.chartConfig.history);
    const value = useSelector((state: RootState) => state.config.config.value);
    const [sum, setSum] = useState(0);

    useEffect(() => {
        setSum(visibleItems.reduce((acc, item) => acc + item.profit, 0));
    }, [visibleItems]);

    const renderHistory = visibleItems.map((items, idx) => {
        return (
            <Fragment key={idx}>
                <div className={`${styles.cell}`}>{convertToUTCDateTime(items.entryTime)}</div>
                <div className={`${styles.cell}`}>{convertToUTCDateTime(items.executedTime)}</div>
                <div className={`${styles.cell} ${items.isTrigger ? styles.buy : styles.sell}`}>{items.isTrigger ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faXmark} />}</div>
                <div className={`${styles.cell}`}>{items.entryPrice.toFixed(3)}</div>
                <div className={`${styles.cell}`}>{items.markPrice.toFixed(3)}</div>
                <div className={`${styles.cell} ${items.side === "short" ? styles.sell : styles.buy}`}>{items.side.toLocaleUpperCase()}</div>
                <div className={`${styles.cell}`}>{items.qty.toFixed(3)}</div>
                <div className={`${styles.cell} ${items.profit > 0 ? styles.buy : styles.sell}`}>{toUSD(items.profit, true)}</div>
            </Fragment>
        );
    });

    return (
        <div className={styles.container}>
            <div className={styles.total}>
                Total PnL:{" "}
                <span className={sum < 0 ? styles.sell : styles.buy}>
                    {toUSD(sum, true)} ~ {((sum * 100) / value).toFixed(2)}%
                </span>
            </div>
            <div className={styles.table}>
                {/* Header Row */}
                <div className={`${styles.cell} ${styles.header}`}>Entry time</div>
                <div className={`${styles.cell} ${styles.header}`}>Executed time</div>
                <div className={`${styles.cell} ${styles.header}`}>isTrigger</div>
                <div className={`${styles.cell} ${styles.header}`}>Entry price</div>
                <div className={`${styles.cell} ${styles.header}`}>Mark price</div>
                <div className={`${styles.cell} ${styles.header}`}>Side</div>
                <div className={`${styles.cell} ${styles.header}`}>Qty</div>
                <div className={`${styles.cell} ${styles.header}`}>Profit</div>

                {/* Data Rows */}
                {renderHistory}
            </div>
        </div>
    );
};

export default HistoryTab;
