import styles from "@src/component/tab/configRecord/configDCARecord.module.scss";
import { RootState } from "@src/redux/store";
import { useSelector } from "react-redux";
import { toUSD } from "@src/utils";
import { Fragment } from "react/jsx-runtime";

const ConfigsRecord = () => {
    const { last3Config } = useSelector((state: RootState) => state.dca);

    // Render last config
    const renderLast3Config = last3Config.map((config, idx) => {
        return (
            <div className={`${styles.config} `} key={idx}>
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
                            <div className={styles.title}>Budget per order (1)</div>
                            <div className={styles.value}>{toUSD(config.value, false)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Total order (2)</div>
                            <div className={styles.value}>{toUSD(config.totalOrder, false)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Total investment (1) x (2)</div>
                            <div className={styles.value}>{toUSD(config.totalOrder * config.value, false)}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Combine with RSI</div>
                            <div className={`${styles.value} ${config.isRSI ? styles.buy : styles.sell}`}>{config.isRSI ? "YES" : "NO"}</div>
                        </div>
                        {config.isRSI && (
                            <Fragment>
                                <div className={styles.row}>
                                    <div className={styles.title}>RSI length</div>
                                    <div className={`${styles.value}`}>{config.rsiLength}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>RSI DCA in</div>
                                    <div className={`${styles.value}`}>{config.rsiDcaIn}</div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.title}>RSI DCA out</div>
                                    <div className={`${styles.value}`}>{config.rsiDcaOut}</div>
                                </div>
                            </Fragment>
                        )}
                        <div className={styles.row}>
                            <div className={styles.title}>Buy condition</div>
                            <div className={`${styles.value}`}>{config.buyCondition === "min" ? "Minimum" : "Averange"}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Time frame</div>
                            <div className={`${styles.value}`}>{config.timeFrame.toLocaleUpperCase()}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    });

    return <div className={styles.container}>{renderLast3Config}</div>;
};

export default ConfigsRecord;
