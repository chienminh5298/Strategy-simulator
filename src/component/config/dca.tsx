import React, { Fragment, useEffect, useState } from "react";
import styles from "./dca.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import { convertToUTCDateTime, toUSD } from "@src/utils";
import { checkDate, getLastDate } from "./customize";
import CurrencyInput from "react-currency-input-field";
import { useMutation } from "@tanstack/react-query";
import { mutationUpdateData } from "@src/http";
import { useDispatch } from "react-redux";
import { systemActions } from "@src/redux/systemReducer";
import { toast } from "react-toastify";
import useFetchYearData from "@src/customHook/fetchTokenDataByYear";
import { dataActions } from "@src/redux/dataReducer";
import { dcaActions, DCAConfig } from "@src/redux/dcaReducer";
import { errorMessage } from "@src/component/config/errorMessage";
import NeedHelp from "../needHelp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import helpStyles from "@src/component/needHelp/index.module.scss";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { chartDCAActions } from "@src/redux/chartDCAReducer";
import { dcaLogic } from "@src/utils/dcaLogic";

let firstRun = false;

const Dca = () => {
    const dispatch = useDispatch();

    const tokenData = useSelector((state: RootState) => state.data);
    const storeDCA = useSelector((state: RootState) => state.dca);
    const { isShowNeedHelpDCA, stepDCA } = useSelector((state: RootState) => state.system);

    const [dataUpToDate, setDataUpToDate] = useState(false);
    const [DCAConfig, setDCAConfig] = useState(storeDCA);
    const [configError, setConfigError] = useState<undefined | "token" | "year" | "value dca" | "total order" | "rsi" | "profit percent">(undefined);

    useEffect(() => {
        if (firstRun) {
            // dispatch(systemActions.showNeedHelp({ type: "dca" }));
            firstRun = false;
        }
    }, []);

    const renderTokens = Object.keys(tokenData).map((token, idx) => (
        <option key={idx} value={token}>
            {token}
        </option>
    ));

    let renderYear;
    if (DCAConfig && DCAConfig.token !== "") {
        renderYear = Object.keys(tokenData[DCAConfig.token]).map((year, idx) => (
            <option key={idx} value={year}>
                {year}
            </option>
        ));
    }

    const renderDataUpToDate = DCAConfig?.token === "" ? <Fragment></Fragment> : getLastDate(tokenData[DCAConfig.token]);

    // Handle select token
    const handleSelectToken = (e: any) => {
        setDCAConfig((prevConfig) => ({
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
        mutationFn: () => mutationUpdateData(DCAConfig.token, getLastDate(tokenData[DCAConfig.token])),
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
        setDCAConfig((prevConfig) => ({
            ...prevConfig,
            year: e.target.value,
        }));
        setConfigError(undefined);
    };

    // Query year data
    const { data: yearData, isLoading, refetch } = useFetchYearData({ token: DCAConfig.token, year: DCAConfig.year });

    useEffect(() => {
        dispatch(systemActions.updateLoading(isLoading));
    }, [isLoading, dispatch]);

    useEffect(() => {
        if (yearData) {
            dispatch(dataActions.updateYearData({ token: DCAConfig.token, year: DCAConfig.year, data: yearData }));
        }
    }, [yearData, dispatch]);

    // Refetch when select a new year
    useEffect(() => {
        if (DCAConfig.token !== "" && DCAConfig.year !== "") {
            if (Object.values(tokenData[DCAConfig.token][parseInt(DCAConfig.year)]).length === 0) {
                refetch();
            }
        }
    }, [DCAConfig.token, DCAConfig.year]);

    // Handle recommend
    useEffect(() => {
        if (configError) {
            toast.error(errorMessage(configError));
        }
    }, [configError]);

    const handleGetRecommend = async (e: any) => {
        e.preventDefault();
        const checkCf = checkConfig(DCAConfig);
        if (checkCf === undefined) {
            dispatch(systemActions.updateLoading(true));
            try {
                const result = await new Promise<DCAConfig>((resolve) => {
                    setTimeout(() => {
                        const newConfig = dcaLogic(DCAConfig, tokenData[DCAConfig.token][DCAConfig.year]);
                        resolve(newConfig);
                    }, 10); // small timeout to force re-render
                });
                setDCAConfig(result);
            } finally {
                dispatch(systemActions.updateLoading(false));
            }
        }
        setConfigError(checkCf);
    };

    // Handle apply config
    const handleApplyConfig = (e: any) => {
        e.preventDefault();
        const checkCf = checkConfig(DCAConfig);
        if (checkCf === undefined) {
            dispatch(dcaActions.updateConfig(DCAConfig)); // Use the newConfig here
            dispatch(chartDCAActions.resetState());
            dispatch(dcaActions.updateIsBacktestRunning(false));
            dispatch(dcaActions.updateIsConfigCorrect(true));
            toast.success("Apply config successfully. You can run backtest now.");
        } else {
            dispatch(dcaActions.updateIsConfigCorrect(false));
        }
        setConfigError(checkCf);
    };

    // Handle need help
    const handleNeedHelp = () => {
        dispatch(systemActions.showNeedHelp({ type: "dca" }));
    };

    return (
        <form className={styles.config} onSubmit={handleApplyConfig}>
            {isShowNeedHelpDCA && stepDCA === 1 && (
                <NeedHelp position="top-right">
                    <div className={helpStyles.helpConfig}>
                        <div className={helpStyles.title}>
                            <FontAwesomeIcon icon={faQuestionCircle} className={helpStyles.icon} />
                            <h3>What is "Total order"</h3>
                        </div>
                        <div className={helpStyles.content}>
                            <span>This is the maximum number of active orders the system can hold at any time.</span>
                        </div>
                        <div className={helpStyles.title}>
                            <FontAwesomeIcon icon={faQuestionCircle} className={helpStyles.icon} />
                            <h3>What is "Total investment"</h3>
                        </div>
                        <div className={helpStyles.content}>
                            <ul>
                                <li>This is the total amount of money you’re allocating for the strategy. It’s calculated by multiplying your Budget per Order by your Total Order limit.</li>
                                <li>For example, if your budget per order is $100 and you allow up to 20 orders, your total investment will be $2,000.</li>
                            </ul>
                        </div>
                        <div className={helpStyles.title}>
                            <FontAwesomeIcon icon={faQuestionCircle} className={helpStyles.icon} />
                            <h3>What is "Profit percent"</h3>
                        </div>
                        <div className={helpStyles.content}>
                            <ul>
                                <li>This sets the target profit for each order.</li>
                                <li>For example, if you buy an order at $100 and set the profit percent to 2%, the system will automatically DCA out (sell) that order when the price reaches $102 or higher at next green candle.</li>
                            </ul>
                        </div>
                        <div className={helpStyles.title}>
                            <FontAwesomeIcon icon={faQuestionCircle} className={helpStyles.icon} />
                            <h3>What is "Combine with RSI"</h3>
                        </div>
                        <div className={helpStyles.content}>
                            <ul>
                                <li>By default, the system only DCA in when red candle and DCA out when green candle.</li>
                                <li>If checked, the system will use RSI (Relative Strength Index) as an additional condition for DCA actions.</li>
                                <li>This helps avoid false signals and improves timing for entries and exits.</li>
                            </ul>
                        </div>
                    </div>
                </NeedHelp>
            )}
            <div className={styles.content}>
                <div className={`${styles.token} ${configError === "token" && styles.errorForm}`}>
                    <div className={styles.row}>
                        <header>Token:</header>
                        <select
                            className={styles.dropdown}
                            value={DCAConfig.token} // Correctly controlled component
                            onChange={handleSelectToken}
                            name="token"
                        >
                            <option value="" disabled>
                                Select token
                            </option>
                            {renderTokens}
                        </select>
                    </div>
                    {DCAConfig.token !== "" && (
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
                    <select className={styles.dropdown} name="year" value={DCAConfig.year} onChange={handleSelectYear}>
                        <option value="" disabled>
                            Select time range
                        </option>
                        {renderYear}
                    </select>
                </div>
                <div className={`${styles.investAmount} ${configError === "value dca" && styles.errorForm}`}>
                    <header>Budget per order: (1)</header>
                    <CurrencyInput
                        id="budget"
                        name="budget"
                        placeholder="Please enter a number"
                        defaultValue={DCAConfig.value}
                        min={500}
                        allowDecimals={false}
                        intlConfig={{ locale: "en-US", currency: "USD" }}
                        allowNegativeValue={false}
                        className={styles.amountInput}
                        onValueChange={(value) => {
                            setDCAConfig((prevConfig) => ({
                                ...prevConfig,
                                value: value === undefined ? 0 : parseInt(value),
                            }));
                            setConfigError(undefined);
                        }}
                    />
                </div>
                <div className={styles.setting}>
                    <div className={`${styles.row} ${configError === "total order" && styles.errorForm}`}>
                        <header>Total order (2)</header>
                        <div className={styles.numberInputContainer}>
                            <input
                                type="number"
                                value={DCAConfig.totalOrder ?? 0}
                                id="totalOrder"
                                name="totalOrder"
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    setDCAConfig((prevConfig) => ({
                                        ...prevConfig,
                                        totalOrder: isNaN(value) ? 0 : value,
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <header>Total investment (1) x (2)</header>
                        <span>{toUSD(DCAConfig.value * DCAConfig.totalOrder, false)}</span>
                    </div>

                    <div className={`${styles.row} ${configError === "profit percent" && styles.errorForm}`}>
                        <header>Profit percent</header>
                        <div className={styles.numberInputContainer}>
                            <input
                                type="number"
                                value={DCAConfig.profitPercent.toFixed(2) ?? 0}
                                id="profitPercent"
                                name="profitPercent"
                                min={1}
                                step={0.1}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setDCAConfig((prevConfig) => ({
                                        ...prevConfig,
                                        profitPercent: isNaN(value) ? 0 : value,
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    <div className={`${styles.row} ${styles.keepOrderOverNight}`}>
                        <header>Combine with RSI</header>
                        <div className={styles.content}>
                            <section title=".squaredOne">
                                <div className={styles.squaredOne}>
                                    <input type="checkbox" value="None" id="isRSI" name="isRSI" onChange={() => setDCAConfig((prevConfig) => ({ ...prevConfig, isRSI: !DCAConfig.isRSI }))} checked={DCAConfig.isRSI} />
                                    <label htmlFor="isRSI"></label>
                                </div>
                            </section>
                        </div>
                    </div>

                    {DCAConfig.isRSI && (
                        <Fragment>
                            <div className={`${styles.row} ${configError === "rsi" && styles.errorForm}`}>
                                <header>RSI length</header>
                                <div className={styles.numberInputContainer}>
                                    <input
                                        type="number"
                                        defaultValue={DCAConfig.rsiLength}
                                        id="rsiLength"
                                        name="rsiLength"
                                        min={5}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            setDCAConfig((prevConfig) => ({
                                                ...prevConfig,
                                                rsiLength: isNaN(value) ? 0 : value,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={`${styles.row} ${configError === "rsi" && styles.errorForm}`}>
                                <header>DCA IN when RSI less than</header>
                                <div className={styles.numberInputContainer}>
                                    <input
                                        type="number"
                                        defaultValue={DCAConfig.rsiDcaIn}
                                        id="rsiDcaIn"
                                        name="rsiDcaIn"
                                        min={0}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            setDCAConfig((prevConfig) => ({
                                                ...prevConfig,
                                                rsiDcaIn: isNaN(value) ? 0 : value,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={`${styles.row} ${configError === "rsi" && styles.errorForm}`}>
                                <header>DCA OUT when RSI greater than</header>
                                <div className={styles.numberInputContainer}>
                                    <input
                                        type="number"
                                        defaultValue={DCAConfig.rsiDcaOut}
                                        id="rsiDcaOut"
                                        name="rsiDcaOut"
                                        min={0}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            setDCAConfig((prevConfig) => ({
                                                ...prevConfig,
                                                rsiDcaOut: isNaN(value) ? 0 : value,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                        </Fragment>
                    )}
                </div>
            </div>
            <footer>
                {isShowNeedHelpDCA && stepDCA === 2 && (
                    <NeedHelp position="top-right">
                        <div className={helpStyles.helpApplyButton}>
                            <span>You should apply the config before run backtest.</span>
                        </div>
                    </NeedHelp>
                )}
                <div className={styles.needHelp} onClick={handleNeedHelp}>
                    Need help ?
                </div>
                <div className={styles.right}>
                    <div className={styles.recommendWrapper}>
                        {isShowNeedHelpDCA && stepDCA === 3 && (
                            <NeedHelp position="bottom-right">
                                <div className={helpStyles.helpApplyButton}>
                                    <span>Or you can get recommend config from system. Don't forget to apply config after it.</span>
                                </div>
                            </NeedHelp>
                        )}
                        <div className={styles.needHelp} onClick={handleGetRecommend}>
                            Get recommend
                        </div>
                    </div>
                    <button type="submit" className={styles.saveButton}>
                        Apply config
                    </button>
                </div>
            </footer>
        </form>
    );
};

export default Dca;

const checkConfig = (config: DCAConfig) => {
    if (config.token === "") return "token";
    if (config.year === "") return "year";
    if (config.value < 100) return "value dca";
    if (config.totalOrder < 10) return "total order";
    if (config.profitPercent <= 0) return "profit percent";
    if (config.isRSI) {
        if (config.rsiLength < 7 || config.rsiLength >= 30 || config.rsiDcaIn <= 0 || config.rsiDcaIn > 100 || config.rsiDcaOut <= 0 || config.rsiDcaOut > 100 || isNaN(config.rsiLength || config.rsiDcaIn || config.rsiDcaOut)) return "rsi";
    }
};
