import React, { Fragment, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import CurrencyInput from "react-currency-input-field";
import styles from "@src/App.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@root/src/redux/store";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { configActions } from "@src/redux/configReducer";
import { errorMessage } from "@src/component/config/errorMessage";

const Config = () => {
    const [dataUpToDate, setDataUpToDate] = useState(false);
    const configQuery = useSelector((state: RootState) => state.config.form);
    const configError = useSelector((state: RootState) => state.config.formError);
    const configTrigger = useSelector((state: RootState) => state.config.isTrigger);
    const [config, setConfig] = useState(configQuery);
    const dispatch = useDispatch();

    let renderStrategyStoplosses = config.strategy.stoplosses.map((sl, idx) => {
        return (
            <Fragment key={idx}>
                <div className={`${styles.col} ${styles.delete}`}>
                    <FontAwesomeIcon icon={faTrashCan} className={styles.deleteRow} onClick={() => handleDeleteTarget("strategy", idx)} />
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
                    <FontAwesomeIcon icon={faTrashCan} className={styles.deleteRow} onClick={() => handleDeleteTarget("triggerStrategy", idx)} />
                </div>
                <div className={styles.col}>
                    <input type="number" defaultValue={sl.target} disabled={idx === 0} />
                </div>
                <div className={styles.col}>
                    <input type="number" defaultValue={sl.percent} step={0.1} />
                </div>
            </Fragment>
        );
    });

    useEffect(() => {
        const checkDataUpToDate = async () => {
            if (config.token) {
                // const lastDate = await readTheLastDay(tokenSelected);
                // console.log(lastDate);
                // Check if data up to date
            }
        };

        checkDataUpToDate();
    }, [config.token]);

    useEffect(() => {
        if (configError) {
            toast.error(errorMessage(configError));
        }
    }, [configError]);

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
    const handleDeleteTarget = (type: "strategy" | "triggerStrategy", idx: number) => {
        setConfig((prevConfig) => {
            if (type === "strategy") {
                return {
                    ...prevConfig,
                    strategy: {
                        ...prevConfig.strategy,
                        stoplosses: prevConfig.strategy.stoplosses.filter((_, index) => index !== idx),
                    },
                };
            } else {
                return {
                    ...prevConfig,
                    triggerStrategy: {
                        ...prevConfig.triggerStrategy,
                        stoplosses: prevConfig.triggerStrategy.stoplosses.filter((_, index) => index !== idx),
                    },
                };
            }
        });
    };

    // Handle submit

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(configActions.applyConfig(config));
    };

    return (
        <form className={styles.config} onSubmit={handleSubmit}>
            <header className={styles.frameHeader}>Config</header>
            <div className={styles.content}>
                <div className={`${styles.token} ${configError === "token" && styles.errorForm}`}>
                    <div className={styles.row}>
                        <header>Token:</header>
                        <select
                            className={styles.dropdown}
                            value={config.token} // Correctly controlled component
                            onChange={(e) =>
                                setConfig((prevConfig) => ({
                                    ...prevConfig,
                                    token: e.target.value,
                                }))
                            }
                            name="token"
                        >
                            <option value="" disabled>
                                Select token
                            </option>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                            <option value="SOL">SOL</option>
                        </select>
                    </div>
                    {config.token !== "" && (
                        <div className={styles.row}>
                            <header>Token updated to: 12-22-2025</header>
                            <button onClick={handleUpdateData} className={styles.updateButton} disabled={dataUpToDate}>
                                Update data
                            </button>
                        </div>
                    )}
                </div>
                <div className={`${styles.time} ${configError === "year" && styles.errorForm}`}>
                    <header>Year:</header>
                    <select
                        className={styles.dropdown}
                        name="year"
                        value={config.year}
                        onChange={(e) =>
                            setConfig((prevConfig) => ({
                                ...prevConfig,
                                year: e.target.value,
                            }))
                        }
                    >
                        <option value="" disabled>
                            Select time range
                        </option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                    </select>
                </div>
                <div className={`${styles.investAmount} ${configError === "value" && styles.errorForm}`}>
                    <header>Value per order:</header>
                    <CurrencyInput
                        id="budget"
                        name="budget"
                        placeholder="Please enter a number"
                        defaultValue={config.value}
                        min={500}
                        allowDecimals={false}
                        intlConfig={{ locale: "en-US", currency: "USD" }}
                        allowNegativeValue={false}
                        className={styles.amountInput}
                        onValueChange={(value) =>
                            setConfig((prevConfig) => ({
                                ...prevConfig,
                                value: value === undefined ? 0 : parseInt(value),
                            }))
                        }
                    />
                </div>
                <div className={styles.prevCandle}>
                    <header>Previous candle is:</header>
                    <div className={styles.side}>
                        <label className={`${styles.option} ${styles.short}`}>
                            <input type="radio" name="prevCandle" value="short" defaultChecked onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, strategy: { stoplosses: [...prevConfig.strategy.stoplosses], side: e.target.value } }))} />
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
                <div className={`${styles.strategy} ${configError === "strategy" && styles.errorForm}`}>
                    <header>
                        <div>Strategy</div>
                        {!configTrigger && (
                            <div className={styles.addStrategy} onClick={() => dispatch(configActions.setTrigger(true))}>
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
                {configTrigger && (
                    <div className={`${styles.strategy} ${configTrigger && styles.show} ${configError === "triggerStrategy" && styles.errorForm}`}>
                        <header>
                            <div>Trigger Strategy</div>
                            <div className={styles.addStrategy} onClick={() => dispatch(configActions.setTrigger(false))}>
                                Delete <FontAwesomeIcon icon={faTrashCan} />
                            </div>
                        </header>
                        <div className={styles.side}>
                            <label className={`${styles.option} ${styles.short}`}>
                                <input type="radio" name="triggerSide" value="short" defaultChecked onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, triggerStrategy: { stoplosses: [...prevConfig.triggerStrategy.stoplosses], side: e.target.value } }))} />
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
                <button type="submit" className={styles.saveButton}>
                    Apply config
                </button>
            </footer>
        </form>
    );
};

export default Config;
