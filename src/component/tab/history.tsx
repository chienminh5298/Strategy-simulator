import React, { Fragment, useEffect, useState } from "react";
import styles from "@src/component/tab/history.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import { candleType } from "@src/redux/dataReducer";
import { OrderType } from "@src/utils/backtestLogic";
import { convertToUTCDateTime } from "@src/utils";

const HistoryTab = () => {
    const { data, duration } = useSelector((state: RootState) => state.chart);

    const [visibleItems, setVisibleItems] = useState<Required<OrderType>[]>([]);

    useEffect(() => {
        let i = 0;
        const tempData = Object.values(data);

        // Ensure interval only runs when there's data
        if (!tempData.length) return;

        const interval = setInterval(() => {
            if (i < tempData.length) {
                const order = tempData[i].executedOrder;

                if (order) {
                    setVisibleItems((prev) => [...prev, order]); // Ensure order exists before setting state
                }
                i++;
            } else {
                clearInterval(interval);
            }
        }, duration);

        return () => clearInterval(interval);
    }, [data, duration]);

    const renderHistory = visibleItems.map((items, idx) => {
        return (
            <Fragment key={idx}>
                <div className={`${styles.cell}`}>{convertToUTCDateTime(items.entryTime)}</div>
                <div className={`${styles.cell}`}>{convertToUTCDateTime(items.executedTime)}</div>
                <div className={`${styles.cell} ${styles.sell}`}>
                    <FontAwesomeIcon icon={faXmark} />
                </div>
                <div className={`${styles.cell}`}>233.23</div>
                <div className={`${styles.cell}`}>290.33</div>
                <div className={`${styles.cell} ${styles.sell}`}>SELL</div>
                <div className={`${styles.cell}`}>0.23</div>
                <div className={`${styles.cell} ${styles.sell}`}>-4.232$</div>
            </Fragment>
        );
    });

    return (
        <div className={styles.container}>
            <div className={styles.total}>Total: 24.323$</div>
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
