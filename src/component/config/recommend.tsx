import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { configActions, RecommendConfigType } from "@src/redux/configReducer";
import { checkDate, getLastDate } from "@src/component/config/customize";
import useFetchYearData from "@src/customHook/fetchTokenDataByYear";
import { chartConfigActions } from "@src/redux/chartConfigReducer";
import { errorMessage } from "@src/component/config/errorMessage";
import styles from "@src/component/config/recommend.module.scss";
import { systemActions } from "@src/redux/systemReducer";
import { recommendLogic } from "@src/utils/recommendLogic";
import CurrencyInput from "react-currency-input-field";
import { dataActions } from "@src/redux/dataReducer";
import { convertToUTCDateTime } from "@src/utils";
import { mutationUpdateData } from "@src/http";
import { RootState } from "@src/redux/store";

const RecommendConfig = () => {
    const storeRecommendConfig = useSelector((state: RootState) => state.config.recommendConfig);

    const dispatch = useDispatch();

    const tokenData = useSelector((state: RootState) => state.data);

    const [dataUpToDate, setDataUpToDate] = useState(false);
    const [recommendConfig, setRecommendConfig] = useState<RecommendConfigType>(storeRecommendConfig);
    const [configError, setConfigError] = useState<undefined | "token" | "year" | "value" | "strategy" | "triggerStrategy">(undefined);

    const renderTokens = Object.keys(tokenData).map((token, idx) => (
        <option key={idx} value={token}>
            {token}
        </option>
    ));

    let renderYear;
    if (recommendConfig && recommendConfig?.token !== "") {
        renderYear = Object.keys(tokenData[recommendConfig.token]).map((year, idx) => (
            <option key={idx} value={year}>
                {year}
            </option>
        ));
    }

    const renderDataUpToDate = recommendConfig?.token === "" ? <Fragment></Fragment> : getLastDate(tokenData[recommendConfig.token]);

    let renderStrategyStoplosses = recommendConfig?.strategy.stoplosses.map((sl, idx) => {
        return (
            <Fragment key={idx}>
                <div className={`${styles.col} ${styles.delete}`}></div>
                <div className={styles.col}>{sl.target || 0}</div>
                <div className={styles.col}>{sl.percent || 0}</div>
            </Fragment>
        );
    });

    let renderTriggerStrategyStoplosses = recommendConfig?.triggerStrategy.stoplosses.map((sl, idx) => {
        return (
            <Fragment key={idx}>
                <div className={`${styles.col} ${styles.delete}`}></div>
                <div className={styles.col}>{sl.target || 0}</div>
                <div className={styles.col}>{sl.percent || 0}</div>
            </Fragment>
        );
    });

    // Handle select token
    const handleSelectToken = (e: any) => {
        setRecommendConfig((prevConfig) => ({
            ...prevConfig,
            token: e.target.value,
        }));
        setConfigError(undefined);
        setDataUpToDate(false);
        if (checkDate(new Date(getLastDate(tokenData[e.target.value])))) {
            setDataUpToDate(true);
        }
    };

    // Handle update token data
    const handleUpdateData = (e: any) => {
        e.preventDefault();
        mutate();
    };

    const { mutate } = useMutation({
        mutationFn: () => mutationUpdateData(recommendConfig?.token, getLastDate(tokenData[recommendConfig.token])),
        onMutate: () => {
            // When the mutation starts, set fetching to true
            dispatch(systemActions.updateLoading(true));
        },
        onError: () => {
            // If an error occurs, stop fetching
            dispatch(systemActions.updateLoading(false));
            toast.error("Can not fetching new data.");
        },
        onSuccess: (res) => {
            // Ensure fetch state resets properly
            refetch();
            dispatch(systemActions.updateLoading(false));
            toast.success("Data fetched successfully.");
            setDataUpToDate(true);
        },
    });

    // Handle select year
    const handleSelectYear = (e: any) => {
        setRecommendConfig((prevConfig) => ({
            ...prevConfig,
            year: e.target.value,
        }));
        setConfigError(undefined);
    };

    // Query year data
    const { data: yearData, isLoading, refetch } = useFetchYearData({ token: recommendConfig?.token, year: recommendConfig?.year });

    useEffect(() => {
        dispatch(systemActions.updateLoading(isLoading));
    }, [isLoading, dispatch]);

    useEffect(() => {
        if (yearData) {
            dispatch(dataActions.updateYearData({ token: recommendConfig?.token, year: recommendConfig?.year, data: yearData }));
        }
    }, [yearData, dispatch]);

    // Refetch when select a new year
    useEffect(() => {
        if (recommendConfig?.token !== "" && recommendConfig?.year !== "") {
            if (Object.values(tokenData[recommendConfig?.token][parseInt(recommendConfig?.year)]).length === 0) {
                refetch();
            }
        }
    }, [recommendConfig?.token, recommendConfig?.year]);

    // Handle recommend
    useEffect(() => {
        if (configError) {
            toast.error(errorMessage(configError));
        }
    }, [configError]);

    const handleGetRecommend = async () => {
        const checkCf = checkConfig(recommendConfig);
        if (checkCf === undefined) {
            dispatch(systemActions.updateLoading(true));
            try {
                const result = await new Promise<{
                    setting: RecommendConfigType["setting"];
                    strategy: RecommendConfigType["strategy"];
                    triggerStrategy: RecommendConfigType["triggerStrategy"];
                }>((resolve) => {
                    setTimeout(() => {
                        const res = recommendLogic(recommendConfig, tokenData[recommendConfig.token][recommendConfig.year]);
                        resolve(res);
                    }, 10); // small timeout to force re-render
                });
                setRecommendConfig((prev) => ({
                    ...prev,
                    setting: result.setting,
                    strategy: result.strategy,
                    triggerStrategy: result.triggerStrategy,
                }));
            } finally {
                dispatch(systemActions.updateLoading(false));
            }
        }
        setConfigError(checkCf);
    };

    // Handle apply config

    const handleApplyConfig = (e: any) => {
        e.preventDefault();
        dispatch(configActions.updateIsConfigCorrect(true));
        dispatch(configActions.updateConfig(recommendConfig)); // Use the newConfig here
        dispatch(chartConfigActions.resetState(""));
        dispatch(configActions.updateIsBacktestRunning(false));
        toast.success("Apply config successfully. You can run backtest now.");
    };

    return (
        <form className={styles.config}>
            <div className={styles.content}>
                <div className={`${styles.token} ${configError === "token" && styles.errorForm}`}>
                    <div className={styles.row}>
                        <header>Token:</header>
                        <select
                            className={styles.dropdown}
                            value={recommendConfig?.token} // Correctly controlled component
                            onChange={handleSelectToken}
                            name="token"
                        >
                            <option value="" disabled>
                                Select token
                            </option>
                            {renderTokens}
                        </select>
                    </div>
                    {recommendConfig?.token !== "" && (
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
                    <select className={styles.dropdown} name="year" value={recommendConfig?.year} onChange={handleSelectYear}>
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
                        defaultValue={recommendConfig.value}
                        min={500}
                        allowDecimals={false}
                        intlConfig={{ locale: "en-US", currency: "USD" }}
                        allowNegativeValue={false}
                        className={styles.amountInput}
                        onValueChange={(value) => {
                            setRecommendConfig((prevConfig) => ({
                                ...prevConfig,
                                value: value === undefined ? 0 : parseInt(value),
                            }));
                            setConfigError(undefined);
                        }}
                    />
                </div>
                <div className={styles.timeFrame}>
                    <div className={styles.side}>
                        <div className={styles.direction}>Time frame:</div>
                        <div className={styles.option}>
                            <label className={`${styles.option} ${styles.long}`}>
                                <input type="radio" name="timeFrame" value="1h" defaultChecked={recommendConfig.setting.timeFrame === "1h"} onChange={() => setRecommendConfig((prevConfig) => ({ ...prevConfig, setting: { ...prevConfig.setting, timeFrame: "1h" } }))} />
                                <span>1H</span>
                            </label>
                            <label className={`${styles.option} ${styles.long}`}>
                                <input type="radio" name="timeFrame" value="4h" defaultChecked={recommendConfig.setting.timeFrame === "4h"} onChange={() => setRecommendConfig((prevConfig) => ({ ...prevConfig, setting: { ...prevConfig.setting, timeFrame: "4h" } }))} />
                                <span>4H</span>
                            </label>
                            <label className={`${styles.option} ${styles.long}`}>
                                <input type="radio" name="timeFrame" value="1d" defaultChecked={recommendConfig.setting.timeFrame === "1d"} onChange={() => setRecommendConfig((prevConfig) => ({ ...prevConfig, setting: { ...prevConfig.setting, timeFrame: "1d" } }))} />
                                <span>1D</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className={styles.setting}>
                    <div className={styles.row}>
                        <header>Maximum loss percent</header>
                        <div className={styles.numberInputContainer}>
                            <button type="button" className={styles.buttonDecrement} onClick={() => setRecommendConfig((prev) => ({ ...prev, maxLossPercent: prev.maxLossPercent - 0.2 }))} data-operation="decrement"></button>
                            <div className={styles.numberInput}>{recommendConfig.maxLossPercent.toFixed(1)}%</div>
                            <button type="button" className={styles.buttonIncrement} onClick={() => setRecommendConfig((prev) => ({ ...prev, maxLossPercent: prev.maxLossPercent + 0.2 }))} data-operation="increment" disabled={recommendConfig.maxLossPercent.toFixed(1) === "-0.4"}></button>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <header>Number of strategy targets</header>
                        <div className={styles.numberInputContainer}>
                            <button type="button" className={styles.buttonDecrement} disabled={recommendConfig.numOfStrategyTarget === 2} onClick={() => setRecommendConfig((prev) => ({ ...prev, numOfStrategyTarget: prev.numOfStrategyTarget - 1 }))} data-operation="decrement"></button>
                            <div className={styles.numberInput}>{recommendConfig.numOfStrategyTarget}</div>
                            <button type="button" className={styles.buttonIncrement} onClick={() => setRecommendConfig((prev) => ({ ...prev, numOfStrategyTarget: prev.numOfStrategyTarget + 1 }))} data-operation="increment" disabled={recommendConfig.numOfStrategyTarget === 5}></button>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <header>Number of trigger strategy targets</header>
                        <div className={styles.numberInputContainer}>
                            <button type="button" className={styles.buttonDecrement} disabled={recommendConfig.numOfTriggerStrategyTarget === 2} onClick={() => setRecommendConfig((prev) => ({ ...prev, numOfTriggerStrategyTarget: prev.numOfTriggerStrategyTarget - 1 }))} data-operation="decrement"></button>
                            <div className={styles.numberInput}>{recommendConfig.numOfTriggerStrategyTarget}</div>
                            <button type="button" className={styles.buttonIncrement} onClick={() => setRecommendConfig((prev) => ({ ...prev, numOfTriggerStrategyTarget: prev.numOfTriggerStrategyTarget + 1 }))} data-operation="increment" disabled={recommendConfig.numOfTriggerStrategyTarget === 5}></button>
                        </div>
                    </div>
                </div>

                {recommendConfig.strategy.stoplosses.length > 0 && (
                    <div className={styles.recommendResult}>
                        <div className={styles.setting}>
                            <div className={`${styles.row} ${styles.closeOrderBeforeNewCandle}`}>
                                <header>Close position before new candle opens?</header>
                                <div className={styles.content}>
                                    <section title=".squaredOne">
                                        <div className={styles.squaredOne}>
                                            <input type="checkbox" value="None" id="closeOrderBeforeNewCandle" name="closeOrderBeforeNewCandle" disabled defaultChecked={recommendConfig?.setting.closeOrderBeforeNewCandle} />
                                            <label htmlFor="closeOrderBeforeNewCandle"></label>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.strategy} ${configError === "strategy" && styles.errorForm}`}>
                            <header>
                                <div>Strategy</div>
                            </header>
                            <div className={styles.side}>
                                <div className={styles.direction}>Direction compared to previous day candle:</div>
                                <div className={styles.option}>
                                    <label className={`${styles.option} ${styles.short}`}>
                                        <input type="radio" name="direction" value="same" readOnly checked={recommendConfig?.strategy.direction === "same"} />
                                        <span>Same</span>
                                    </label>

                                    <label className={`${styles.option} ${styles.long}`}>
                                        <input type="radio" name="direction" value="opposite" readOnly checked={recommendConfig?.strategy.direction === "opposite"} />
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
                                </div>
                            </div>
                        </div>
                        {recommendConfig?.setting.isTrigger && (
                            <div className={`${styles.strategy} ${configError === "triggerStrategy" && styles.errorForm}`}>
                                <header>
                                    <div>Trigger Strategy</div>
                                </header>
                                <div className={styles.side}>
                                    <div className={styles.direction}>Direction compared to strategy:</div>
                                    <div className={styles.option}>
                                        <label className={`${styles.option} ${styles.short}`}>
                                            <input type="radio" name="triggerDirection" value="same" readOnly checked={recommendConfig?.strategy.direction === "same"} />
                                            <span>Same</span>
                                        </label>

                                        <label className={`${styles.option} ${styles.long}`}>
                                            <input type="radio" name="triggerDirection" value="opposite" readOnly checked={recommendConfig?.strategy.direction === "opposite"} />
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
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <footer>
                <div className={styles.needHelp}>Need help ?</div>
                <div className={styles.right}>
                    <div className={styles.needHelp} onClick={handleGetRecommend}>
                        Get recommend
                    </div>
                    <button type="submit" disabled={recommendConfig.strategy.stoplosses.length === 0} className={styles.saveButton} onClick={handleApplyConfig}>
                        Apply config
                    </button>
                </div>
            </footer>
        </form>
    );
};

export default RecommendConfig;

const checkConfig = (config: RecommendConfigType) => {
    if (config.token === "") return "token";
    if (config.year === "") return "year";
    if (config.value < 500) return "value";
};
