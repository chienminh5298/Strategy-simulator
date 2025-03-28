import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "@src/component/tab/analyse/analyse.module.scss";
import { toUSD } from "@src/utils";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltipProfitMonthly}>
                <p>{label}</p>
                <div className={styles.tooltipContent}>
                    <div className={styles.tooltipRow}>
                        <p className={styles.title}>Total</p>
                        <p className={styles.value}>{toUSD(payload[0].value)}</p>
                    </div>
                    <div className={styles.tooltipRow}>
                        <p className={styles.title}>Profit</p>
                        <p className={`${styles.value} ${styles.buy}`}>{toUSD(payload[1].value)}</p>
                    </div>
                    <div className={styles.tooltipRow}>
                        <p className={styles.title}>Loss</p>
                        <p className={`${styles.value} ${styles.sell}`}>{toUSD(payload[2].value * -1)}</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

const ValueByMonth = () => {
    const data = useSelector((state: RootState) => state.chartConfig.analyse.profitByMonthlyChart);

    return (
        <ResponsiveContainer width="90%" height={250}>
            <BarChart data={data}>
                <defs>
                    <linearGradient id="profitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="15%" stopColor="#4bffb5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4bffb5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lossColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="15%" stopColor="#ff4976" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ff4976" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="15%" stopColor="#2897ff" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2897ff" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Bar dataKey="total" fill="url(#totalColor)" stroke="#999999" />
                <Bar dataKey="profit" fill="url(#profitColor)" stroke="#999999" />
                <Bar dataKey="loss" fill="url(#lossColor)" stroke="#999999" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ValueByMonth;
