import React, { Fragment, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import CurrencyInput from "react-currency-input-field";
import styles from "@src/App.module.scss";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { errorMessage } from "@src/component/config/errorMessage";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

type configType = {
    token: string;
    year: string;
    value: number;
    prevCandle: "red" | "green";
    strategy: {
        side: "long" | "short";
        stoplosses: {
            target: number;
            percent: number;
        }[];
    };
    triggerStrategy: {
        side: "long" | "short";
        stoplosses: {
            target: number;
            percent: number;
        }[];
    };
};

const Config = () => {
    const [dataUpToDate, setDataUpToDate] = useState(false);
    const [configError, setConfigError] = useState<undefined | "token" | "year" | "value" | "strategy" | "triggerStrategy">(undefined);
    const tokenData = useSelector((state: RootState) => state.data);
    const [isTrigger, setIsTrigger] = useState<boolean>(true);
    const [config, setConfig] = useState<configType>({
        token: "",
        year: "",
        value: 500,
        prevCandle: "red",
        strategy: {
            side: "long",
            stoplosses: [
                {
                    target: 0,
                    percent: -2,
                },
                {
                    target: 0.7,
                    percent: 0.7,
                },
            ],
        },
        triggerStrategy: {
            side: "short",
            stoplosses: [
                {
                    target: 0,
                    percent: -2,
                },
                {
                    target: 0.7,
                    percent: 0.7,
                },
            ],
        },
    });

    let renderTokens = Object.keys(tokenData).map((token, idx) => (
        <option key={idx} value={token}>
            {token}
        </option>
    ));

    let renderYear;
    if (config.token !== "") {
        renderYear = Object.keys(tokenData[config.token]).map((year, idx) => (
            <option key={idx} value={year}>
                {year}
            </option>
        ));
    }

    let renderStrategyStoplosses = config.strategy.stoplosses.map((sl, idx) => {
        return (
            <Fragment key={idx}>
                <div className={`${styles.col} ${styles.delete}`}>
                    <FontAwesomeIcon icon={faTrashCan} className={styles.deleteRow} onClick={() => handleDeleteTarget("strategy", idx)} />
                </div>
                <div className={styles.col}>
                    <input type="number" defaultValue={sl.target} disabled={idx === 0} step={0.1} onChange={(e) => handleTargetPercent("strategy", idx, "target", parseFloat(e.target.value))} />
                </div>
                <div className={styles.col}>
                    <input type="number" defaultValue={sl.percent} step={0.1} onChange={(e) => handleTargetPercent("strategy", idx, "percent", parseFloat(e.target.value))} />
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
                    <input type="number" defaultValue={sl.target} disabled={idx === 0} step={0.1} onChange={(e) => handleTargetPercent("triggerStrategy", idx, "target", parseFloat(e.target.value))} />
                </div>
                <div className={styles.col}>
                    <input type="number" defaultValue={sl.percent} step={0.1} onChange={(e) => handleTargetPercent("triggerStrategy", idx, "percent", parseFloat(e.target.value))} />
                </div>
            </Fragment>
        );
    });

    // handle on change input target & percent
    const handleTargetPercent = (type: "strategy" | "triggerStrategy", idx: number, inputType: "target" | "percent", value: number) => {
        setConfig((prevConfig) => {
            if (!prevConfig[type] || !prevConfig[type].stoplosses) return prevConfig; // Ensure safety

            return {
                ...prevConfig,
                [type]: {
                    ...prevConfig[type],
                    stoplosses: prevConfig[type].stoplosses.map((sl, i) => (i === idx ? { ...sl, [inputType]: value } : sl)),
                },
            };
        });
    };

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
        setConfigError(undefined);
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
        const checkCf = checkConfig(config, isTrigger);
        if (checkCf === undefined) {
            setConfig(config);
        } else {
            setConfigError(checkCf);
        }
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
                            onChange={(e) => {
                                setConfig((prevConfig) => ({
                                    ...prevConfig,
                                    token: e.target.value,
                                }));
                                setConfigError(undefined);
                            }}
                            name="token"
                        >
                            <option value="" disabled>
                                Select token
                            </option>
                            {renderTokens}
                        </select>
                    </div>
                    {config.token !== "" && (
                        <div className={styles.row}>
                            <header>Token updated to: {}</header>
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
                        onChange={(e) => {
                            setConfig((prevConfig) => ({
                                ...prevConfig,
                                year: e.target.value,
                            }));
                            setConfigError(undefined);
                        }}
                    >
                        <option value="" disabled>
                            Select time range
                        </option>
                        {renderYear}
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
                        onValueChange={(value) => {
                            setConfig((prevConfig) => ({
                                ...prevConfig,
                                value: value === undefined ? 0 : parseInt(value),
                            }));
                            setConfigError(undefined);
                        }}
                    />
                </div>
                <div className={styles.prevCandle}>
                    <header>Previous candle is:</header>
                    <div className={styles.side}>
                        <label className={`${styles.option} ${styles.short}`}>
                            <input type="radio" name="prevCandle" value="short" defaultChecked onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, prevCandle: "red" }))} />
                            <span>
                                RED <FontAwesomeIcon icon={faArrowDown} />
                            </span>
                        </label>

                        <label className={`${styles.option} ${styles.long}`}>
                            <input type="radio" name="prevCandle" value="long" onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, prevCandle: "green" }))} />
                            <span>
                                GREEN <FontAwesomeIcon icon={faArrowUp} />
                            </span>
                        </label>
                    </div>
                </div>
                <div className={`${styles.strategy} ${configError === "strategy" && styles.errorForm}`}>
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
                            <input type="radio" name="side" value="short" defaultChecked={config.strategy.side === "short"} onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, strategy: { stoplosses: [...prevConfig.strategy.stoplosses], side: e.target.value as "short" } }))} />
                            <span>
                                SHORT <FontAwesomeIcon icon={faArrowDown} />
                            </span>
                        </label>

                        <label className={`${styles.option} ${styles.long}`}>
                            <input type="radio" name="side" value="long" defaultChecked={config.strategy.side === "long"} onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, strategy: { stoplosses: [...prevConfig.strategy.stoplosses], side: e.target.value as "long" } }))} />
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
                    <div className={`${styles.strategy} ${isTrigger && styles.show} ${configError === "triggerStrategy" && styles.errorForm}`}>
                        <header>
                            <div>Trigger Strategy</div>
                            <div className={styles.addStrategy} onClick={() => setIsTrigger(false)}>
                                Delete <FontAwesomeIcon icon={faTrashCan} />
                            </div>
                        </header>
                        <div className={styles.side}>
                            <label className={`${styles.option} ${styles.short}`}>
                                <input type="radio" name="triggerSide" value="short" defaultChecked onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, triggerStrategy: { stoplosses: [...prevConfig.triggerStrategy.stoplosses], side: e.target.value as "short" } }))} />
                                <span>
                                    SHORT <FontAwesomeIcon icon={faArrowDown} />
                                </span>
                            </label>

                            <label className={`${styles.option} ${styles.long}`}>
                                <input type="radio" name="triggerSide" value="long" onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, triggerStrategy: { stoplosses: [...prevConfig.triggerStrategy.stoplosses], side: e.target.value as "long" } }))} />
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

const checkConfig = (config: configType, isTrigger: boolean) => {
    if (config.token === "") return "token";
    if (config.year === "") return "year";
    if (config.value < 500) return "value";
    // Check strategy
    const checkStrategy = checkStrategyFn(config.strategy.stoplosses);
    if (checkStrategy !== undefined) return checkStrategy;
    // Check trigger strategy
    if (isTrigger) {
        const checkTriggerStrategy = checkStrategyFn(config.triggerStrategy.stoplosses);
        if (checkTriggerStrategy !== undefined) return "triggerStrategy";
    }
};

const checkStrategyFn = (
    stoplosses: {
        target: number;
        percent: number;
    }[]
) => {
    // Check strategy has at lease 2 stoplosses
    if (stoplosses.length < 2) return "strategy";
    // Check each stoploss
    // Check for duplicate target values
    const targetSet = new Set<number>();
    for (const stoploss of stoplosses) {
        if (targetSet.has(stoploss.target)) return "strategy"; // Duplicate target found
        targetSet.add(stoploss.target);

        // Check if percent is greater than target
        if (stoploss.percent > stoploss.target) return "strategy";
    }
    // Check first stoploss target === 0
    if (stoplosses[0].target !== 0) return "strategy";
    // Check last stoploss percent should === target to close order
    const lastStoploss = stoplosses[stoplosses.length - 1];
    if (lastStoploss.percent !== lastStoploss.target) return "strategy";
};

const checkDate = (date: Date) => {
    const today = new Date();
    return date.getDate() + 1 === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const getLastDate = () => {
    const lastYear = Object.keys(tokenData[config.token]).pop();
    if (lastYear) {
        console.log(tokenData[config.token][parseInt(lastYear)][tokenData[config.token][parseInt(lastYear)].length - 1]);
    }
};
