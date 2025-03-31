import React from "react";
import styles from "@src/component/tab/analyse/analyseDCA.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import { toUSD } from "@src/utils";
import ValueOverTimeDCA from "./chart/valueOverTimeDCA";

const AnalyseDCA = () => {
    const dcaConfig = useSelector((state: RootState) => state.dca);
    const { analyse, currentPrice, history } = useSelector((state: RootState) => state.chartDCA);

    const totalInvestment = dcaConfig.totalOrder * dcaConfig.value;
    const oriValue = analyse.basket.leftOrder * dcaConfig.value;
    const curValue = analyse.basket.qty * currentPrice;
    const totalLoss = curValue - oriValue;
    const historyPL = history.reduce((total, o) => o.profit + total, 0);
    const realizedPL = historyPL + totalLoss;
    const historyAvgEntryPrice = history.reduce((total, o) => o.entryPrice + total, 0) / history.length;
    const historyAvgMarkPrice = history.reduce((total, o) => o.markPrice + total, 0) / history.length;

    return (
        <div className={styles.container}>
            <div className={styles.info}>
                <div className={styles.infoPart}>
                    <h2>Configuration</h2>
                    <div className={styles.content}>
                        <div className={styles.row}>
                            <div className={styles.title}>Token</div>
                            <div className={styles.value}>{dcaConfig.token}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Data year</div>
                            <div className={styles.value}>{dcaConfig.year}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Budget per order (1)</div>
                            <div className={styles.value}>{toUSD(dcaConfig.value, false)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Total order (2)</div>
                            <div className={styles.value}>{toUSD(dcaConfig.totalOrder, false)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Total investment (1) x (2)</div>
                            <div className={styles.value}>{toUSD(dcaConfig.totalOrder * dcaConfig.value, false)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Combine with RSI</div>
                            <div className={`${styles.value} ${dcaConfig.isRSI ? styles.buy : styles.sell}`}>{dcaConfig.isRSI ? "YES" : "NO"}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>RSI length</div>
                            <div className={`${styles.value}`}>{dcaConfig.rsiLength}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>RSI DCA in</div>
                            <div className={`${styles.value}`}>{dcaConfig.rsiDcaIn}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>RSI DCA out</div>
                            <div className={`${styles.value}`}>{dcaConfig.rsiDcaOut}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Buy condition</div>
                            <div className={`${styles.value}`}>{dcaConfig.buyCondition === "min" ? "Minimum" : "Averange"}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Time frame</div>
                            <div className={`${styles.value}`}>{dcaConfig.timeFrame.toLocaleUpperCase()}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.chartsSection}>
                <div className={styles.chartPart}>
                    <h2>Value over time</h2>
                    <div className={styles.charts}>
                        <ValueOverTimeDCA />
                    </div>
                </div>
                <div className={styles.chartPart}>
                    <h2>Overall & Detail</h2>
                    <div className={styles.charts}>
                        <div className={styles.chart}>
                            <h2>Overall</h2>
                            <div className={styles.content}>
                                <div className={styles.row}>
                                    <div className={styles.title}>Maximum order</div>
                                    <div className={`${styles.value}`}>
                                        {analyse.overall.maxOrder}/{dcaConfig.totalOrder}
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Maximum loss realized P&L</div>
                                    <div className={`${styles.value} ${styles.sell}`}>
                                        {toUSD(analyse.overall.maxLoss)} ~ {(100 - ((totalInvestment - analyse.overall.maxLoss) / totalInvestment) * 100).toFixed(2)}%
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Maximum profit realized P&L</div>
                                    <div className={`${styles.value} ${styles.buy}`}>
                                        {toUSD(analyse.overall.maxProfit)} ~ {(100 - ((totalInvestment - analyse.overall.maxProfit) / totalInvestment) * 100).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.chart}>
                            <h2>Basket</h2>
                            <div className={styles.content}>
                                <div className={styles.row}>
                                    <div className={styles.title}>Left order (3)</div>
                                    <div className={`${styles.value}`}>{analyse.basket.leftOrder}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Left Qty (4)</div>
                                    <div className={`${styles.value}`}>{analyse.basket.qty.toFixed(4)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Current price (5)</div>
                                    <div className={`${styles.value}`}>{toUSD(currentPrice, false)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Original value (6) = (1) x (3)</div>
                                    <div className={`${styles.value}`}>{toUSD(oriValue, false)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Current value (7) = (4) x (5)</div>
                                    <div className={`${styles.value}`}>{toUSD(curValue, false)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Total loss (8) = (6) - (7)</div>
                                    <div className={`${styles.value} ${totalLoss < 0 ? styles.sell : styles.buy}`}>{toUSD(totalLoss)}</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.chart}>
                            <h2>History</h2>
                            <div className={styles.content}>
                                <div className={styles.row}>
                                    <div className={styles.title}>Total order</div>
                                    <div className={`${styles.value}`}>{history.length}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Averange entry price</div>
                                    <div className={`${styles.value}`}>{toUSD(historyAvgEntryPrice, false)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Averange mark price</div>
                                    <div className={`${styles.value}`}>{toUSD(historyAvgMarkPrice, false)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Total P&L (9)</div>
                                    <div className={`${styles.value} ${styles.buy}`}>{toUSD(historyPL)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Realized P&L (9) - (8)</div>
                                    <div className={`${styles.value} ${realizedPL < 0 ? styles.sell : styles.buy}`}>{toUSD(realizedPL)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyseDCA;
