import React, { Fragment } from "react";
import styles from "@src/component/tab/analyse/analyse.module.scss";
import { toUSD } from "@src/utils";
import ValueOverTime from "@src/component/tab/analyse/chart/valueOverTime";
import ValueByMonth from "@src/component/tab/analyse/chart/valueByMonth";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

const AnalyseTab = () => {
    const config = useSelector((state: RootState) => state.config.config);
    const { overView, strategyBreakDown, triggerStrategyBreakDown } = useSelector((state: RootState) => state.chartConfig.analyse);

    // Render configuration strategy & triggerStrategy
    let renderStrategy = config.strategy.stoplosses.map((stoploss, idx) => (
        <div className={styles.strategy} key={idx}>
            <div className={styles.row}>
                <div className={styles.title}>Target</div>
                <div className={styles.value}>{stoploss.target}</div>
            </div>
            <div className={styles.row}>
                <div className={styles.title}>Percent</div>
                <div className={styles.value}>{stoploss.percent}</div>
            </div>
        </div>
    ));

    let renderTriggerStrategy = config.setting.isTrigger
        ? config.triggerStrategy.stoplosses.map((stoploss, idx) => (
              <div className={styles.strategy} key={idx}>
                  <div className={styles.row}>
                      <div className={styles.title}>Target</div>
                      <div className={styles.value}>{stoploss.target}</div>
                  </div>
                  <div className={styles.row}>
                      <div className={styles.title}>Percent</div>
                      <div className={styles.value}>{stoploss.percent}</div>
                  </div>
              </div>
          ))
        : "";

    // Render breakdown strategy & trigger strategy target hit times
    let strategyHitTimes = config.strategy.stoplosses.map((stoploss, idx) => (
        <div className={styles.row} key={idx}>
            <div className={styles.title}>Target {stoploss.target}%</div>
            <div className={styles.value}>{strategyBreakDown.targetHit[idx]} times</div>
        </div>
    ));
    let triggerStrategyHitTimes = config.triggerStrategy.stoplosses.map((stoploss, idx) => (
        <div className={styles.row} key={idx}>
            <div className={styles.title}>Target {stoploss.target}%</div>
            <div className={styles.value}>{triggerStrategyBreakDown.targetHit[idx]} times</div>
        </div>
    ));
    return (
        <div className={styles.container}>
            <div className={styles.info}>
                <div className={styles.infoPart}>
                    <h2>Configuration</h2>
                    <div className={styles.content}>
                        <div className={styles.row}>
                            <div className={styles.title}>Token</div>
                            <div className={styles.value}>{config.token}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Data year</div>
                            <div className={styles.value}>{config.year}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Close position before new candle opens?</div>
                            <div className={`${styles.value} ${config.setting.closeOrderBeforeNewCandle ? styles.buy : styles.sell}`}>{config.setting.closeOrderBeforeNewCandle ? "YES" : "NO"}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Time frame</div>
                            <div className={`${styles.value}`}>{config.setting.timeFrame}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Trigger strategy</div>
                            <div className={`${styles.value} ${config.setting.isTrigger ? styles.buy : styles.sell}`}>{config.setting.isTrigger ? "YES" : "NO"}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Value per order</div>
                            <div className={styles.value}>{toUSD(config.value, false)}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.infoPart}>
                    <h3>Strategy</h3>
                    <div className={styles.direction}>
                        <div className={styles.title}>Direction</div>
                        <div className={`${styles.value} ${config.strategy.direction === "opposite" ? styles.buy : styles.sell}`}>{config.strategy.direction.toUpperCase()}</div>
                    </div>
                    <div className={styles.content}>{renderStrategy}</div>
                </div>
                {config.setting.isTrigger && (
                    <div className={styles.infoPart}>
                        <h3>Trigger strategy</h3>
                        <div className={styles.direction}>
                            <div className={styles.title}>Direction</div>
                            <div className={`${styles.value} ${config.triggerStrategy.direction === "opposite" ? styles.buy : styles.sell}`}>{config.triggerStrategy.direction.toUpperCase()}</div>
                        </div>
                        <div className={styles.content}>{renderTriggerStrategy}</div>
                    </div>
                )}

                <div className={styles.infoPart}>
                    <h2>Performance summary</h2>
                    <div className={styles.content}>
                        <div className={styles.row}>
                            <div className={styles.title}>Total PnL</div>
                            <div className={`${styles.value} ${overView.totalPnL > 0 ? styles.buy : styles.sell}`}>{toUSD(overView.totalPnL)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.title} ${styles.sell}`}>Broker (binance.com) taker fee 0.05%</div>
                            <div className={`${styles.value} ${styles.sell}`}>{toUSD(overView.fee, false)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Highest profit</div>
                            <div className={`${styles.value} ${styles.buy}`}>{toUSD(overView.highestProfit)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Highest loss</div>
                            <div className={`${styles.value} ${styles.sell}`}>{toUSD(overView.highestLoss)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Win rate</div>
                            <div className={`${styles.value} ${styles.buy}`}>
                                {overView.winRate.toFixed(2)}% ~ {toUSD(overView.longProfit + overView.shortProfit)}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Loss rate</div>
                            <div className={`${styles.value} ${styles.sell}`}>
                                {overView.lossRate.toFixed(2)}% ~ {toUSD(overView.longLoss + overView.shortLoss)}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Total trade</div>
                            <div className={styles.value}>{overView.totalTrade}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.infoPart}>
                    <h2>Trade break down</h2>
                    <div className={styles.content}>
                        <div className={styles.row}>
                            <div className={styles.title}>Averange profit per trade</div>
                            <div className={`${styles.value} ${styles.buy}`}>{toUSD(overView.averangeProfit)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Averange loss per trade</div>
                            <div className={`${styles.value} ${styles.sell}`}>{toUSD(overView.averangeLoss)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Long order</div>
                            <div className={styles.value}>{overView.longOrder}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Long profit</div>
                            <div className={`${styles.value} ${styles.buy}`}>{toUSD(overView.longProfit)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Long loss</div>
                            <div className={`${styles.value} ${styles.sell}`}>{toUSD(overView.longLoss)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Short order</div>
                            <div className={styles.value}>{overView.shortOrder}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Short profit</div>
                            <div className={`${styles.value} ${styles.buy}`}>{toUSD(overView.shortProfit)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Short loss</div>
                            <div className={`${styles.value} ${styles.sell}`}>{toUSD(overView.shortLoss)}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.chartsSection}>
                <div className={styles.chartPart}>
                    <h2>Value over time</h2>
                    <div className={styles.charts}>
                        <ValueOverTime />
                    </div>
                </div>
                <div className={styles.chartPart}>
                    <h2>Profit by monthly</h2>
                    <div className={styles.charts}>
                        <ValueByMonth />
                    </div>
                </div>
                <div className={styles.chartPart}>
                    <h2>Strategy & trigger strategy</h2>
                    <div className={styles.charts}>
                        <div className={styles.chart}>
                            <h2>Strategy</h2>
                            <div className={styles.content}>
                                <div className={styles.row}>
                                    <div className={styles.title}>Total PnL</div>
                                    <div className={`${styles.value} ${strategyBreakDown.totalPnL > 0 ? styles.buy : styles.sell}`}>{toUSD(strategyBreakDown.totalPnL)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Win rate</div>
                                    <div className={`${styles.value} ${styles.buy}`}>
                                        {strategyBreakDown.winRate.toFixed(2)}% ~ {toUSD(strategyBreakDown.longProfit + strategyBreakDown.shortProfit)}
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Loss rate</div>
                                    <div className={`${styles.value} ${styles.sell}`}>
                                        {strategyBreakDown.lossRate.toFixed(2)}% ~ {toUSD(strategyBreakDown.longLoss + strategyBreakDown.shortLoss)}
                                    </div>
                                </div>
                            </div>
                            <h3>Target hit</h3>
                            <div className={styles.content}>{strategyHitTimes}</div>
                            <h3>Break down</h3>
                            <div className={styles.content}>
                                <div className={styles.row}>
                                    <div className={styles.title}>Long order</div>
                                    <div className={styles.value}>{strategyBreakDown.longOrder}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Long profit</div>
                                    <div className={`${styles.value} ${styles.buy}`}>{toUSD(strategyBreakDown.longProfit)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Long loss</div>
                                    <div className={`${styles.value} ${styles.sell}`}>{toUSD(strategyBreakDown.longLoss)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Short order</div>
                                    <div className={styles.value}>{strategyBreakDown.shortOrder}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Short profit</div>
                                    <div className={`${styles.value} ${styles.buy}`}>{toUSD(strategyBreakDown.shortProfit)}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>Short loss</div>
                                    <div className={`${styles.value} ${styles.sell}`}>{toUSD(strategyBreakDown.shortLoss)}</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.chart}>
                            {config.setting.isTrigger && (
                                <Fragment>
                                    <h2>Trigger strategy</h2>
                                    <div className={styles.content}>
                                        <div className={styles.row}>
                                            <div className={styles.title}>Total PnL</div>
                                            <div className={`${styles.value} ${triggerStrategyBreakDown.totalPnL > 0 ? styles.buy : styles.sell}`}>{toUSD(triggerStrategyBreakDown.totalPnL)}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.title}>Win rate</div>
                                            <div className={`${styles.value} ${styles.buy}`}>
                                                {triggerStrategyBreakDown.winRate.toFixed(2)}% ~ {toUSD(triggerStrategyBreakDown.longProfit + triggerStrategyBreakDown.shortProfit)}
                                            </div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.title}>Loss rate</div>
                                            <div className={`${styles.value} ${styles.sell}`}>
                                                {triggerStrategyBreakDown.lossRate.toFixed(2)}% ~ {toUSD(triggerStrategyBreakDown.longLoss + triggerStrategyBreakDown.shortLoss)}
                                            </div>
                                        </div>
                                    </div>
                                    <h3>Target hit</h3>
                                    <div className={styles.content}>{triggerStrategyHitTimes}</div>
                                    <h3>Break down</h3>
                                    <div className={styles.content}>
                                        <div className={styles.row}>
                                            <div className={styles.title}>Long order</div>
                                            <div className={styles.value}>{triggerStrategyBreakDown.longOrder}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.title}>Long profit</div>
                                            <div className={`${styles.value} ${styles.buy}`}>{toUSD(triggerStrategyBreakDown.longProfit)}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.title}>Long loss</div>
                                            <div className={`${styles.value} ${styles.sell}`}>{toUSD(triggerStrategyBreakDown.longLoss)}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.title}>Short order</div>
                                            <div className={styles.value}>{triggerStrategyBreakDown.shortOrder}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.title}>Short profit</div>
                                            <div className={`${styles.value} ${styles.buy}`}>{toUSD(triggerStrategyBreakDown.shortProfit)}</div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.title}>Short loss</div>
                                            <div className={`${styles.value} ${styles.sell}`}>{toUSD(triggerStrategyBreakDown.shortLoss)}</div>
                                        </div>
                                    </div>
                                </Fragment>
                            )}
                        </div>
                        <div className={styles.chart}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyseTab;
