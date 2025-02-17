import React from "react";
import styles from "@src/component/tab/analyse/analyse.module.scss";
import { toUSD } from "@src/utils";
import ValueOverTime from "@src/component/tab/analyse/chart/valueOverTime";
import ValueByMonth from "@src/component/tab/analyse/chart/valueByMonth";
import WinLoss from "./chart/winLoss";

const AnalyseTab = () => {
    return (
        <div className={styles.container}>
            <div className={styles.info}>
                <div className={styles.infoPart}>
                    <h2>Configuration</h2>
                    <div className={styles.content}>
                        <div className={styles.row}>
                            <div className={styles.title}>Token</div>
                            <div className={styles.value}>SOLANA</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Data year</div>
                            <div className={styles.value}>2025</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Keep order overnight</div>
                            <div className={styles.value}>YES</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Trigger strategy</div>
                            <div className={styles.value}>YES</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Value per order</div>
                            <div className={styles.value}>{toUSD(30000)}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.infoPart}>
                    <h3>Strategy</h3>
                    <div className={styles.content}>
                        <div className={styles.strategy}>
                            <div className={styles.row}>
                                <div className={styles.title}>Target</div>
                                <div className={styles.value}>0</div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.title}>Percent</div>
                                <div className={styles.value}>-2</div>
                            </div>
                        </div>
                        <div className={styles.strategy}>
                            <div className={styles.row}>
                                <div className={styles.title}>Target</div>
                                <div className={styles.value}>0.7</div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.title}>Percent</div>
                                <div className={styles.value}>0.7</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.infoPart}>
                    <h3>Trigger strategy</h3>
                    <div className={styles.content}>
                        <div className={styles.strategy}>
                            <div className={styles.row}>
                                <div className={styles.title}>Target</div>
                                <div className={styles.value}>0</div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.title}>Percent</div>
                                <div className={styles.value}>-2</div>
                            </div>
                        </div>
                        <div className={styles.strategy}>
                            <div className={styles.row}>
                                <div className={styles.title}>Target</div>
                                <div className={styles.value}>0.7</div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.title}>Percent</div>
                                <div className={styles.value}>0.7</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.infoPart}>
                    <h2>Performance summary</h2>
                    <div className={styles.content}>
                        <div className={styles.row}>
                            <div className={styles.title}>Total PnL</div>
                            <div className={styles.value}>{toUSD(30000)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Win rate</div>
                            <div className={styles.value}>70% ~ {toUSD(3000, false)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Loss rate</div>
                            <div className={styles.value}>30% ~ {toUSD(1000, false)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Total trade</div>
                            <div className={styles.value}>40</div>
                        </div>
                    </div>
                </div>
                <div className={styles.infoPart}>
                    <h2>Trade break down</h2>
                    <div className={styles.content}>
                        <div className={styles.row}>
                            <div className={styles.title}>Averange profit per trade</div>
                            <div className={styles.value}>{toUSD(30000)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Averange loss per trade</div>
                            <div className={styles.value}>{toUSD(-3000)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Long order</div>
                            <div className={styles.value}>40</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Long profit</div>
                            <div className={styles.value}>{toUSD(3000)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Long loss</div>
                            <div className={styles.value}>{toUSD(-3000)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Short order</div>
                            <div className={styles.value}>40</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Short profit</div>
                            <div className={styles.value}>{toUSD(3000)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Short loss</div>
                            <div className={styles.value}>{toUSD(-3000)}</div>
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
                    <h2>Trade break down</h2>
                    <div className={styles.charts}>
                        <div className={styles.chart}>
                            <WinLoss />
                        </div>
                        <div className={styles.chart}>a</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyseTab;
