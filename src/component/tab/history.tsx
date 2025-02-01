import React from "react";
import styles from "@src/component/tab/history.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

const HistoryTab = () => {
    return (
        <div className={styles.container}>
            <div className={styles.total}>
                Total: 24.323$
            </div>
            <div className={styles.table}>
                {/* Header Row */}
                <div className={`${styles.cell} ${styles.header}`}>Date</div>
                <div className={`${styles.cell} ${styles.header}`}>Time</div>
                <div className={`${styles.cell} ${styles.header}`}>isTrigger</div>
                <div className={`${styles.cell} ${styles.header}`}>Entry price</div>
                <div className={`${styles.cell} ${styles.header}`}>Mark price</div>
                <div className={`${styles.cell} ${styles.header}`}>Side</div>
                <div className={`${styles.cell} ${styles.header}`}>Qty</div>
                <div className={`${styles.cell} ${styles.header}`}>Profit</div>

                {/* Data Rows */}
                <div className={`${styles.cell}`}>12-01-2024</div>
                <div className={`${styles.cell}`}>23:11:22</div>
                <div className={`${styles.cell} ${styles.buy}`}>
                    <FontAwesomeIcon icon={faCheck} />
                </div>
                <div className={`${styles.cell}`}>233.23</div>
                <div className={`${styles.cell}`}>290.33</div>
                <div className={`${styles.cell} ${styles.buy}`}>BUY</div>
                <div className={`${styles.cell}`}>0.23</div>
                <div className={`${styles.cell} ${styles.buy}`}>4.232$</div>

                <div className={`${styles.cell}`}>12-01-2024</div>
                <div className={`${styles.cell}`}>23:11:22</div>
                <div className={`${styles.cell} ${styles.sell}`}>
                    <FontAwesomeIcon icon={faXmark} />
                </div>
                <div className={`${styles.cell}`}>233.23</div>
                <div className={`${styles.cell}`}>290.33</div>
                <div className={`${styles.cell} ${styles.sell}`}>SELL</div>
                <div className={`${styles.cell}`}>0.23</div>
                <div className={`${styles.cell} ${styles.sell}`}>-4.232$</div>

                <div className={`${styles.cell}`}>12-01-2024</div>
                <div className={`${styles.cell}`}>23:11:22</div>
                <div className={`${styles.cell} ${styles.sell}`}>
                    <FontAwesomeIcon icon={faXmark} />
                </div>
                <div className={`${styles.cell}`}>233.23</div>
                <div className={`${styles.cell}`}>290.33</div>
                <div className={`${styles.cell} ${styles.sell}`}>SELL</div>
                <div className={`${styles.cell}`}>0.23</div>
                <div className={`${styles.cell} ${styles.buy}`}>4.232$</div>
            </div>
        </div>
    );
};

export default HistoryTab;
