import styles from "@src/component/tab/configRecord/configRecord.module.scss";
import { RootState } from "@src/redux/store";
import { useSelector } from "react-redux";
import { toUSD } from "@src/utils";

const ConfigsRecord = () => {
    const { bestConfig, last3Config } = useSelector((state: RootState) => state.config);

    // Render last 3 config
    const renderLast3Config = last3Config.map(({ config, profitPercent }, idx) => {
        // Render best configuration strategy & triggerStrategy
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

        return (
            <div className={`${styles.config} `} key={idx}>
                <div className={styles.infoPart}>
                    <h2>Last 3 configs</h2>
                    <div className={styles.content}>
                        <div className={styles.row}>
                            <div className={styles.title}>Total profit percent</div>
                            <div className={styles.value}>{profitPercent.toFixed(2)}%</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Token</div>
                            <div className={styles.value}>{config.token}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Data year</div>
                            <div className={styles.value}>{config.year}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Keep order overnight</div>
                            <div className={`${styles.value} ${config.setting.closeOrderBeforeNewCandle ? styles.buy : styles.sell}`}>{config.setting.closeOrderBeforeNewCandle ? "YES" : "NO"}</div>
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
            </div>
        );
    });

    // Render best configuration strategy & triggerStrategy
    let renderStrategy = bestConfig?.config.strategy.stoplosses.map((stoploss, idx) => (
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

    let renderTriggerStrategy = bestConfig?.config.setting.isTrigger
        ? bestConfig?.config.triggerStrategy.stoplosses.map((stoploss, idx) => (
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

    return (
        <div className={styles.container}>
            <div className={`${styles.config} ${styles.borderBest}`}>
                <div className={styles.infoPart}>
                    <h2>Best config</h2>
                    <div className={styles.content}>
                        <div className={styles.row}>
                            <div className={styles.title}>Total profit percent</div>
                            <div className={styles.value}>{bestConfig?.profitPercent.toFixed(2)}%</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Token</div>
                            <div className={styles.value}>{bestConfig?.config.token}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Data year</div>
                            <div className={styles.value}>{bestConfig?.config.year}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Keep order overnight</div>
                            <div className={`${styles.value} ${bestConfig?.config.setting.closeOrderBeforeNewCandle ? styles.buy : styles.sell}`}>{bestConfig?.config.setting.closeOrderBeforeNewCandle ? "YES" : "NO"}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Trigger strategy</div>
                            <div className={`${styles.value} ${bestConfig?.config.setting.isTrigger ? styles.buy : styles.sell}`}>{bestConfig?.config.setting.isTrigger ? "YES" : "NO"}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.title}>Value per order</div>
                            <div className={styles.value}>{toUSD(bestConfig?.config.value, false)}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.infoPart}>
                    <h3>Strategy</h3>
                    <div className={styles.direction}>
                        <div className={styles.title}>Direction</div>
                        <div className={`${styles.value} ${bestConfig?.config.strategy.direction === "opposite" ? styles.buy : styles.sell}`}>{bestConfig?.config.strategy.direction.toUpperCase()}</div>
                    </div>
                    <div className={styles.content}>{renderStrategy}</div>
                </div>
                {bestConfig?.config.setting.isTrigger && (
                    <div className={styles.infoPart}>
                        <h3>Trigger strategy</h3>
                        <div className={styles.direction}>
                            <div className={styles.title}>Direction</div>
                            <div className={`${styles.value} ${bestConfig?.config.triggerStrategy.direction === "opposite" ? styles.buy : styles.sell}`}>{bestConfig?.config.triggerStrategy.direction.toUpperCase()}</div>
                        </div>
                        <div className={styles.content}>{renderTriggerStrategy}</div>
                    </div>
                )}
            </div>

            {renderLast3Config}
        </div>
    );
};

export default ConfigsRecord;
