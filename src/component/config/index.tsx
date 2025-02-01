import React, { Fragment, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import CurrencyInput from "react-currency-input-field";
import styles from "@src/App.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@root/src/redux/store";
// import { readTheLastDay } from "@src/googleSheet";

const Config = () => {
    const [isTrigger, setIsTrigger] = useState(true);
    const [tokenSelected, setTokenSelected] = useState<undefined | string>();
    const [dataUpToDate, setDataUpToDate] = useState(false);

    const configQuery = useSelector((state: RootState) => state.config);
    const [config, setConfig] = useState(configQuery);

    let renderStrategyStoplosses = config.strategy.stoplosses.map((sl, idx) => {
        return (
            <Fragment key={idx}>
                <div className={`${styles.col} ${styles.delete}`}>
                    <FontAwesomeIcon icon={faTrashCan} className={styles.deleteRow} />
                </div>
                <div className={styles.col}>
                    <input type="number" defaultValue={sl.target} disabled={idx === 0} />
                </div>
                <div className={styles.col}>
                    <input type="number" defaultValue={sl.percent} />
                </div>
            </Fragment>
        );
    });

    let renderTriggerStrategyStoplosses = config.triggerStrategy.stoplosses.map((sl, idx) => {
        return (
            <Fragment key={idx}>
                <div className={`${styles.col} ${styles.delete}`}>
                    <FontAwesomeIcon icon={faTrashCan} className={styles.deleteRow} />
                </div>
                <div className={styles.col}>
                    <input type="number" defaultValue={sl.target} disabled={idx === 0} />
                </div>
                <div className={styles.col}>
                    <input type="number" defaultValue={sl.percent} />
                </div>
            </Fragment>
        );
    });

    useEffect(() => {
        const checkDataUpToDate = async () => {
            if (tokenSelected) {
                // const lastDate = await readTheLastDay(tokenSelected);
                // console.log(lastDate);
                // Check if data up to date
            }
        };

        checkDataUpToDate();
    }, [tokenSelected]);

    // Handle update token data
    const handleUpdateData = (e: any) => {
        e.preventDefault();
    };

    // Handle add target
    const handleAddTarget = (type: "strategy" | "triggerStrategy") => {
        if (type === "strategy") {
            setConfig((prevConfig) => ({
                ...prevConfig,
                strategy: {
                    ...prevConfig.strategy,
                    stoplosses: [...prevConfig.strategy.stoplosses, { target: 0, percent: 0 }],
                },
            }));
        } else {
            setConfig((prevConfig) => ({
                ...prevConfig,
                triggerStrategy: {
                    ...prevConfig.triggerStrategy,
                    stoplosses: [...prevConfig.triggerStrategy.stoplosses, { target: 0, percent: 0 }],
                },
            }));
        }
    };

    // Handle delete target
    const handleDeleteTarget = (type: "strategy" | "triggerStrategy", idx: number) => {};

    return (
        <form className={styles.config}>
            <header className={styles.frameHeader}>Config</header>
            <div className={styles.content}>
                <div className={styles.token}>
                    <div className={styles.row}>
                        <header>Token:</header>
                        <select className={styles.dropdown} onChange={(e) => setTokenSelected(e.target.value)}>
                            <option value="" disabled selected>
                                Select token
                            </option>
                            <option value="BTC" selected={config.token === "BTC"}>
                                BTC
                            </option>
                            <option value="ETH" selected={config.token === "ETH"}>
                                ETH
                            </option>
                            <option value="SOL" selected={config.token === "SOL"}>
                                SOL
                            </option>
                        </select>
                    </div>
                    {tokenSelected !== undefined && (
                        <div className={styles.row}>
                            <header>Token updated to: 12-22-2025</header>
                            <button onClick={handleUpdateData} className={styles.updateButton} disabled={dataUpToDate}>
                                Update data
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.time}>
                    <header>Year:</header>
                    <select className={styles.dropdown}>
                        <option value="" disabled selected>
                            Select time range
                        </option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                    </select>
                </div>
                <div className={styles.investAmount}>
                    <header>Value per order:</header>
                    <CurrencyInput id="budget" name="budget" placeholder="Please enter a number" defaultValue={500} min={500} allowDecimals={false} intlConfig={{ locale: "en-US", currency: "USD" }} allowNegativeValue={false} className={styles.amountInput} />
                </div>
                <div className={styles.prevCandle}>
                    <header>Previous candle is:</header>
                    <div className={styles.side}>
                        <label className={`${styles.option} ${styles.short}`}>
                            <input type="radio" name="prevCandle" value="short" defaultChecked />
                            <span>
                                RED <FontAwesomeIcon icon={faArrowDown} />
                            </span>
                        </label>

                        <label className={`${styles.option} ${styles.long}`}>
                            <input type="radio" name="prevCandle" value="long" />
                            <span>
                                GREEN <FontAwesomeIcon icon={faArrowUp} />
                            </span>
                        </label>
                    </div>
                </div>
                <div className={styles.strategy}>
                    <header>
                        <div>Strategy</div>
                        {!isTrigger && (
                            <div className={styles.addStrategy} onClick={() => setIsTrigger(true)}>
                                Add trigger
                            </div>
                        )}
                    </header>
                    <div className={styles.side}>
                        <label className={`${styles.option} ${styles.short}`}>
                            <input type="radio" name="side" value="short" defaultChecked={config.strategy.side === "short"} />
                            <span>
                                SHORT <FontAwesomeIcon icon={faArrowDown} />
                            </span>
                        </label>

                        <label className={`${styles.option} ${styles.long}`}>
                            <input type="radio" name="side" value="long" defaultChecked={config.strategy.side === "long"} />
                            <span>
                                LONG <FontAwesomeIcon icon={faArrowUp} />
                            </span>
                        </label>
                    </div>
                    <div className={styles.stoplosses}>
                        <div className={styles.stoploss}>
                            <div className={styles.grid}>
                                <div className={styles.header}>Stoploss</div>
                                <div className={styles.header}>Target</div>
                                <div className={styles.header}>Percent</div>

                                {renderStrategyStoplosses}
                            </div>

                            <div className={styles.addRow}>
                                <span onClick={() => handleAddTarget("strategy")}>Add target</span>
                            </div>
                        </div>
                    </div>
                </div>
                {isTrigger && (
                    <div className={`${styles.strategy} ${isTrigger && styles.show}`}>
                        <header>
                            <div>Trigger Strategy</div>
                            <div className={styles.addStrategy} onClick={() => setIsTrigger(false)}>
                                Delete <FontAwesomeIcon icon={faTrashCan} />
                            </div>
                        </header>
                        <div className={styles.side}>
                            <label className={`${styles.option} ${styles.short}`}>
                                <input type="radio" name="triggerSide" value="short" defaultChecked />
                                <span>
                                    SHORT <FontAwesomeIcon icon={faArrowDown} />
                                </span>
                            </label>

                            <label className={`${styles.option} ${styles.long}`}>
                                <input type="radio" name="triggerSide" value="long" />
                                <span>
                                    LONG <FontAwesomeIcon icon={faArrowUp} />
                                </span>
                            </label>
                        </div>
                        <div className={styles.stoplosses}>
                            <div className={styles.stoploss}>
                                <div className={styles.grid}>
                                    <div className={styles.header}>Stoploss</div>
                                    <div className={styles.header}>Target</div>
                                    <div className={styles.header}>Percent</div>

                                    {renderTriggerStrategyStoplosses}
                                </div>

                                <div className={styles.addRow}>
                                    <span onClick={() => handleAddTarget("triggerStrategy")}>Add target</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <footer>
                <div className={styles.needHelp}>Need help ?</div>
                <div className={styles.saveButton}>Save config</div>
            </footer>
        </form>
    );
};

export default Config;
