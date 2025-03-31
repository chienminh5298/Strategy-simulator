import { Fragment } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@src/redux/store";
import NeedHelp from "@src/component/needHelp";
import { convertToUTCDateTime, toUSD } from "@src/utils";
import helpStyles from "@src/component/needHelp/index.module.scss";
import styles from "@src/component/tab/history/dcaHistory.module.scss";
const DcaHistory = () => {
    const dcaConfig = useSelector((state: RootState) => state.dca);
    const { openOrder, history, currentPrice } = useSelector((state: RootState) => state.chartDCA);
    const { isShowNeedHelpDCA, stepDCA } = useSelector((state: RootState) => state.system);

    const renderOpenOrders = Object.values(openOrder)
        .sort((a, b) => a.entryPrice - b.entryPrice)
        .map((order, idx) => (
            <Fragment key={idx}>
                <div className={`${styles.cell}`}>{convertToUTCDateTime(order.entryTime)}</div>
                <div className={`${styles.cell}`}>{order.entryPrice}</div>
                <div className={`${styles.cell}`}>{order.qty.toFixed(2)}</div>
            </Fragment>
        ));

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
    const basketLength = Object.keys(openOrder).length;
    const totalQty = Object.values(openOrder).reduce((total, order) => total + order.qty, 0);
    const realizedTotal = sumHistory - (basketLength * dcaConfig.value - totalQty * currentPrice);
    const percent = (realizedTotal * 100) / (dcaConfig.value * dcaConfig.totalOrder);

    return (
        <div className={styles.container}>
            <div className={styles.basketOrder}>
                <header>
                    <div className={styles.title}>Basket order</div>
                    <div className={styles.orderLeft}>
                        ({basketLength}/{dcaConfig.totalOrder}) ~ {toUSD(totalQty * currentPrice, false)}
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
                        {isShowNeedHelpDCA && stepDCA === 4 && (
                            <NeedHelp position="middle-left">
                                <div className={`${helpStyles.helpConfig} ${styles.realizedTotal}`}>Realized P&L = Realized profit + (Current value of open orders - Number of open orders × Budget per order)</div>
                            </NeedHelp>
                        )}
                        <div className={styles.totalContent}>
                            Realized P&L (after basket loss): <div className={realizedTotal < 0 ? styles.sell : styles.buy}>{toUSD(realizedTotal.toFixed(4))}</div> ~ <div className={realizedTotal < 0 ? styles.sell : styles.buy}>{percent.toFixed(2)}%</div>
                        </div>
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
