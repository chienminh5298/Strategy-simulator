import React, { Fragment } from "react";
import styles from "./dcaHistory.module.scss";
import { convertToUTCDateTime, toUSD } from "@src/utils";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

const DcaHistory = () => {
    const { openOrder, history } = useSelector((state: RootState) => state.chartDCA);
    const dcaConfig = useSelector((state: RootState) => state.dca);
    const renderOpenOrders = Object.values(openOrder)
        .sort((a, b) => a.entryPrice - b.entryPrice)
        .map((order, idx) => (
            <Fragment key={idx}>
                <div className={`${styles.cell}`}>{convertToUTCDateTime(order.entryTime)}</div>
                <div className={`${styles.cell}`}>{order.entryPrice}</div>
                <div className={`${styles.cell}`}>{order.qty.toFixed(2)}</div>
            </Fragment>
        ));

    const sumOpenOrders = Object.values(openOrder).length * dcaConfig.value;

    const renderHistory = history.map((order, idx) => (
        <Fragment key={idx}>
            <div className={`${styles.cell}`}>{convertToUTCDateTime(order.entryTime)}</div>
            <div className={`${styles.cell}`}>{convertToUTCDateTime(order.executedTime)}</div>
            <div className={`${styles.cell}`}>{order.entryPrice}</div>
            <div className={`${styles.cell}`}>{order.markPrice}</div>
            <div className={`${styles.cell}`}>{order.qty.toFixed(2)}</div>
            <div className={`${styles.cell} ${styles.buy}`}>{toUSD(order.profit.toFixed(4))}</div>
        </Fragment>
    ));

    const sumHistory = history.reduce((acc, order) => acc + order.profit, 0);
    const percent = (sumHistory * 100) / (dcaConfig.value * dcaConfig.totalOrder);
    return (
        <div className={styles.container}>
            <div className={styles.basketOrder}>
                <header>
                    <div className={styles.title}>Basket order</div>
                    <div className={styles.orderLeft}>
                        ({Object.keys(openOrder).length}/{dcaConfig.totalOrder}) ~ {toUSD(sumOpenOrders, false)}
                    </div>
                </header>
                <div className={styles.table}>
                    <div className={`${styles.cell} ${styles.header}`}>Entry time</div>
                    <div className={`${styles.cell} ${styles.header}`}>Entry price</div>
                    <div className={`${styles.cell} ${styles.header}`}>Qty</div>
                    {renderOpenOrders}
                </div>
            </div>
            <div className={styles.history}>
                <header>
                    <div className={styles.title}>History</div>
                    <div className={styles.totalPL}>
                        Total P&L: {toUSD(sumHistory.toFixed(4))} ~ {percent.toFixed(2)}%
                    </div>
                </header>
                <div className={styles.table}>
                    <div className={`${styles.cell} ${styles.header}`}>Entry time</div>
                    <div className={`${styles.cell} ${styles.header}`}>Executed time</div>
                    <div className={`${styles.cell} ${styles.header}`}>Entry price</div>
                    <div className={`${styles.cell} ${styles.header}`}>Mark price</div>
                    <div className={`${styles.cell} ${styles.header}`}>Qty</div>
                    <div className={`${styles.cell} ${styles.header}`}>Profit</div>
                    {renderHistory}
                </div>
            </div>
        </div>
    );
};

export default DcaHistory;
