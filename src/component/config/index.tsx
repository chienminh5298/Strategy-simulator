import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { faBook, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { fetchTokenDataByYear, mutationUpdateData } from "@src/http";
import helpStyles from "@src/component/needHelp/index.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { errorMessage } from "@src/component/config/errorMessage";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { needHelpActions } from "@src/redux/needHelpReducer";
import { configActions } from "@src/redux/configReducer";
import CurrencyInput from "react-currency-input-field";
import { useDispatch, useSelector } from "react-redux";
import { chartActions } from "@src/redux/chartReducer";
import { dataActions } from "@src/redux/dataReducer";
import { convertToUTCDateTime } from "@src/utils";
import NeedHelp from "@src/component/needHelp";
import { RootState } from "@src/redux/store";
import styles from "@src/App.module.scss";
import { toast } from "react-toastify";

export type StoplossType = {
    target: number;
    percent: number;
};

export type configType = {
    token: string;
    year: string;
    value: number;
    setting: {
        keepOrderOverNight: boolean;
        isTrigger: boolean;
    };
    strategy: {
        direction: "same" | "opposite";
        stoplosses: StoplossType[];
    };
    triggerStrategy: {
        direction: "same" | "opposite";
        stoplosses: StoplossType[];
    };
};

type ConfigProps = {
    setIsFetchData: Dispatch<SetStateAction<boolean>>;
};

const Config: React.FC<ConfigProps> = ({ setIsFetchData }) => {
    const { isShowNeedHelp, step } = useSelector((state: RootState) => state.needHelp);
    const dispatch = useDispatch();
    const [dataUpToDate, setDataUpToDate] = useState(false);
    const [configError, setConfigError] = useState<undefined | "token" | "year" | "value" | "strategy" | "triggerStrategy">(undefined);
    const tokenData = useSelector((state: RootState) => state.data);
    const storeConfig = useSelector((state: RootState) => state.config.config);
    const [config, setConfig] = useState<configType>(storeConfig);

    console.log("config", storeConfig);
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
                    <input type="number" value={sl.target || 0} disabled={idx === 0} step={0.1} onChange={(e) => handleTargetPercent("strategy", idx, "target", parseFloat(e.target.value))} />
                </div>
                <div className={styles.col}>
                    <input type="number" value={sl.percent || 0} step={0.1} onChange={(e) => handleTargetPercent("strategy", idx, "percent", parseFloat(e.target.value))} />
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
                    <input type="number" value={sl.target || 0} disabled={idx === 0} step={0.1} onChange={(e) => handleTargetPercent("triggerStrategy", idx, "target", parseFloat(e.target.value))} />
                </div>
                <div className={styles.col}>
                    <input type="number" value={sl.percent || 0} step={0.1} onChange={(e) => handleTargetPercent("triggerStrategy", idx, "percent", parseFloat(e.target.value))} />
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
        if (configError) {
            toast.error(errorMessage(configError));
        }
    }, [configError]);

    // Handle update token data
    const handleUpdateData = (e: any) => {
        e.preventDefault();
        mutate();
    };

    const { mutate } = useMutation({
        mutationFn: () => mutationUpdateData(config.token, getLastDate(tokenData[config.token])),
        onMutate: () => {
            // When the mutation starts, set fetching to true
            setIsFetchData(true);
        },
        onError: () => {
            // If an error occurs, stop fetching
            setIsFetchData(false);
            toast.error("Can not fetching new data.");
        },
        onSuccess: (res) => {
            // Ensure fetch state resets properly
            refetch();
            setIsFetchData(false);
            toast.success("Data fetched successfully.");
            setDataUpToDate(true);
        },
    });

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
        const checkCf = checkConfig(config);
        if (checkCf === undefined) {
            // Sort stoploss arrays
            const sortedStrategyStoplosses = [...config.strategy.stoplosses].sort((a, b) => a.target - b.target);
            const sortedTriggerStoplosses = [...config.triggerStrategy.stoplosses].sort((a, b) => a.target - b.target);

            const newConfig = {
                ...config,
                strategy: { ...config.strategy, stoplosses: sortedStrategyStoplosses },
                triggerStrategy: { ...config.triggerStrategy, stoplosses: sortedTriggerStoplosses },
            };
            setConfig(newConfig); // This ensures UI re-render
            dispatch(configActions.updateIsConfigCorrect(true));
            dispatch(configActions.updateConfig(newConfig)); // Use the newConfig here
            dispatch(chartActions.resetState());
            dispatch(configActions.updateIsBacktestRunning(false));
            toast.success("Apply config successfully. You can run backtest now.");
        } else {
            dispatch(configActions.updateIsConfigCorrect(false));
        }
        setConfigError(checkCf);
    };

    // Handle select token
    const handleSelectToken = (e: any) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            token: e.target.value,
        }));
        setConfigError(undefined);
        setDataUpToDate(false);
        if (checkDate(new Date(getLastDate(tokenData[e.target.value])))) {
            setDataUpToDate(true);
        }
    };

    // Handle select year
    const handleSelectYear = (e: any) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            year: e.target.value,
        }));
        setConfigError(undefined);
    };

    // Query year data
    const {
        data: yearData,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["data", config.token, config.year],
        queryFn: () => fetchTokenDataByYear(config.token, config.year),
        enabled: false,
    });

    useEffect(() => {
        setIsFetchData(isLoading);
    }, [isLoading, setIsFetchData]);

    useEffect(() => {
        if (yearData) {
            dispatch(dataActions.updateYearData({ token: config.token, year: config.year, data: yearData }));
        }
    }, [yearData, dispatch]);

    // Refetch when select a new year
    useEffect(() => {
        if (config.token !== "" && config.year !== "") {
            if (Object.values(tokenData[config.token][parseInt(config.year)]).length === 0) {
                refetch();
            }
        }
    }, [config.token, config.year]);

    let renderDataUpToDate = config.token === "" ? <Fragment></Fragment> : getLastDate(tokenData[config.token]);

    return (
        <form className={styles.config} onSubmit={handleSubmit}>
            {isShowNeedHelp && step === 1 && (
                <NeedHelp position="top-right">
                    <div className={helpStyles.helpConfig}>
                        <div className={helpStyles.title}>
                            <FontAwesomeIcon icon={faBook} className={helpStyles.icon} />
                            <h3>How to setup configuration</h3>
                        </div>
                        <div className={helpStyles.content}>
                            <ul>
                                <li>Select the token.</li>
                                <li>Select data year.</li>
                                <li>Enter budget for each order.</li>
                            </ul>
                        </div>
                        <div className={helpStyles.title}>
                            <FontAwesomeIcon icon={faQuestionCircle} className={helpStyles.icon} />
                            <h3>What is "Keep over night"</h3>
                        </div>
                        <div className={helpStyles.content}>
                            <span>This is a scalping trade system, so it will close the old order and open a new one every midnight. If 'Keep Overnight' is turned on, instead of closing the old order, the system will keep it open until it hits the stop loss or the last target.</span>
                        </div>
                        <div className={helpStyles.title}>
                            <FontAwesomeIcon icon={faQuestionCircle} className={helpStyles.icon} />
                            <h3>What is "Trigger strategy"</h3>
                        </div>
                        <div className={helpStyles.content}>
                            <span>The trigger strategy is a strategy that will be triggered immediately when the strategy hits the last target. If you don’t need it, you can delete it.</span>
                        </div>
                        <div className={helpStyles.title}>
                            <FontAwesomeIcon icon={faQuestionCircle} className={helpStyles.icon} />
                            <h3>What is "Direction"</h3>
                        </div>
                        <div className={helpStyles.content}>
                            <ul>
                                <li>The 'Direction' of the strategy is compared to the previous daily candle. For example, if 'Direction' is set to 'Opposite' and the previous daily candle is red (price decreased), the system will open a 'Long' position.</li>
                                <li>The 'Direction' of the trigger strategy is the same as the 'Direction' of the strategy, but it is compared to the strategy instead of the daily candle.</li>
                            </ul>
                        </div>
                        <div className={helpStyles.title}>
                            <FontAwesomeIcon icon={faQuestionCircle} className={helpStyles.icon} />
                            <h3>Target & percent</h3>
                        </div>
                        <div className={helpStyles.content}>
                            <ul>
                                <li>"If the price hits the target, a stop loss will be set. For example, if the target is 2% and the stop loss percentage is 1%, it means that when the price increases by 2%, a stop loss will be set at 1%.</li>
                                <li>Target is unique.</li>
                                <li>Default target is set at 0 (entry).</li>
                                <li>Percent always smaller than target.</li>
                                <li>Just only last target, percent has to be equal target.</li>
                            </ul>
                        </div>
                    </div>
                </NeedHelp>
            )}
            <header className={styles.frameHeader}>Config</header>
            <div className={styles.content}>
                <div className={`${styles.token} ${configError === "token" && styles.errorForm}`}>
                    <div className={styles.row}>
                        <header>Token:</header>
                        <select
                            className={styles.dropdown}
                            value={config.token} // Correctly controlled component
                            onChange={handleSelectToken}
                            name="token"
                        >
                            <option value="" disabled>
                                Select token
                            </option>
                            {renderTokens}
                        </select>
                    </div>
                    {config.token !== "" && (
                        <div className={`${styles.row} ${styles.dataUpToDate}`}>
                            <header>
                                <div>Data updated to:</div>
                                <strong>{convertToUTCDateTime(renderDataUpToDate)}</strong>
                            </header>
                            <button onClick={handleUpdateData} className={styles.updateButton} disabled={dataUpToDate}>
                                Update data
                            </button>
                        </div>
                    )}
                </div>
                <div className={`${styles.time} ${configError === "year" && styles.errorForm}`}>
                    <header>Year:</header>
                    <select className={styles.dropdown} name="year" value={config.year} onChange={handleSelectYear}>
                        <option value="" disabled>
                            Select time range
                        </option>
                        {renderYear}
                    </select>
                </div>
                <div className={`${styles.investAmount} ${configError === "value" && styles.errorForm}`}>
                    <header>Budget per order:</header>
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
                <div className={styles.setting}>
                    <div className={`${styles.row} ${styles.keepOrderOverNight}`}>
                        <header>Keep order overnight</header>
                        <div className={styles.content}>
                            <section title=".squaredOne">
                                <div className={styles.squaredOne}>
                                    <input type="checkbox" value="None" id="keepOrderOverNight" name="keepOrderOverNight" onChange={() => setConfig((prevConfig) => ({ ...prevConfig, setting: { ...prevConfig.setting, keepOrderOverNight: !config.setting.keepOrderOverNight } }))} />
                                    <label htmlFor="keepOrderOverNight"></label>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
                <div className={`${styles.strategy} ${configError === "strategy" && styles.errorForm}`}>
                    <header>
                        <div>Strategy</div>
                        {!config.setting.isTrigger && (
                            <div className={styles.addStrategy} onClick={() => setConfig((prevConfig) => ({ ...prevConfig, setting: { ...prevConfig.setting, isTrigger: true } }))}>
                                Add trigger
                            </div>
                        )}
                    </header>
                    <div className={styles.side}>
                        <div className={styles.direction}>Direction compared to previous day candle:</div>
                        <div className={styles.option}>
                            <label className={`${styles.option} ${styles.short}`}>
                                <input type="radio" name="direction" value="same" defaultChecked={config.strategy.direction === "same"} onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, strategy: { stoplosses: [...prevConfig.strategy.stoplosses], direction: e.target.value as "same" } }))} />
                                <span>Same</span>
                            </label>

                            <label className={`${styles.option} ${styles.long}`}>
                                <input type="radio" name="direction" value="opposite" defaultChecked={config.strategy.direction === "opposite"} onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, strategy: { stoplosses: [...prevConfig.strategy.stoplosses], direction: e.target.value as "opposite" } }))} />
                                <span>Opposite</span>
                            </label>
                        </div>
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
                {config.setting.isTrigger && (
                    <div className={`${styles.strategy} ${config.setting.isTrigger && styles.show} ${configError === "triggerStrategy" && styles.errorForm}`}>
                        <header>
                            <div>Trigger Strategy</div>
                            <div className={styles.addStrategy} onClick={() => setConfig((prevConfig) => ({ ...prevConfig, setting: { ...prevConfig.setting, isTrigger: false } }))}>
                                Delete <FontAwesomeIcon icon={faTrashCan} />
                            </div>
                        </header>
                        <div className={styles.side}>
                            <div className={styles.direction}>Direction compared to strategy:</div>
                            <div className={styles.option}>
                                <label className={`${styles.option} ${styles.short}`}>
                                    <input type="radio" name="triggerDirection" value="same" defaultChecked={config.triggerStrategy.direction === "same"} onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, triggerStrategy: { stoplosses: [...prevConfig.triggerStrategy.stoplosses], direction: e.target.value as "same" } }))} />
                                    <span>Same</span>
                                </label>

                                <label className={`${styles.option} ${styles.long}`}>
                                    <input type="radio" name="triggerDirection" value="opposite" defaultChecked={config.triggerStrategy.direction === "opposite"} onChange={(e) => setConfig((prevConfig) => ({ ...prevConfig, triggerStrategy: { stoplosses: [...prevConfig.triggerStrategy.stoplosses], direction: e.target.value as "opposite" } }))} />
                                    <span>Opposite</span>
                                </label>
                            </div>
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
                {isShowNeedHelp && step === 2 && (
                    <NeedHelp position="top-right">
                        <div className={helpStyles.helpApplyButton}>
                            <span>You have to apply config to save it.</span>
                        </div>
                    </NeedHelp>
                )}
                <div className={styles.needHelp} onClick={() => dispatch(needHelpActions.showNeedHelp())}>
                    Need help ?
                </div>
                <button type="submit" className={styles.saveButton}>
                    Apply config
                </button>
            </footer>
        </form>
    );
};

export default Config;

const checkConfig = (config: configType) => {
    if (config.token === "") return "token";
    if (config.year === "") return "year";
    if (config.value < 500) return "value";
    // Check strategy
    const checkStrategy = checkStrategyFn(config.strategy.stoplosses);
    if (checkStrategy !== undefined) return checkStrategy;
    // Check trigger strategy
    if (config.setting.isTrigger) {
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
    if (stoplosses.length < 2) return "strategy";

    const sortedStoplosses = [...stoplosses].sort((a, b) => a.target - b.target); // Create a copy and sort

    const targetSet = new Set<number>();
    for (let i = 0; i < sortedStoplosses.length; i++) {
        const stoploss = sortedStoplosses[i];
        if (targetSet.has(stoploss.target)) return "strategy";
        targetSet.add(stoploss.target);

        // Check if not last target, percent can't === target
        if (i < sortedStoplosses.length - 1 && stoploss.percent === stoploss.target) return "strategy";
        // Check if percent is greater than target
        if (stoploss.percent > stoploss.target) return "strategy";
    }
    if (sortedStoplosses[0].target !== 0) return "strategy";
    const lastStoploss = sortedStoplosses[sortedStoplosses.length - 1];
    if (lastStoploss.percent !== lastStoploss.target) return "strategy";
};

const checkDate = (date: Date) => {
    const today = new Date();
    return date.getDate() + 1 === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const getLastDate = (data: { [token: string]: any[] }) => {
    const thisYear = Object.keys(data).pop();
    if (thisYear) {
        const dataThisYear = Object.values(data[thisYear]);
        return dataThisYear[dataThisYear.length - 1].Date;
    } else {
        return undefined;
    }
};
