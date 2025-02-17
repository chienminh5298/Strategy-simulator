import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "@src/component/tab/analyse/analyse.module.scss";
import { toUSD } from "@src/utils";

const data = [
    { month: "January", total: 4589, profit: 6724, loss: 3156 },
    { month: "February", total: 8792, profit: 8532, loss: 4297 },
    { month: "March", total: 6721, profit: 2345, loss: 7890 },
    { month: "April", total: 2156, profit: 9123, loss: 1784 },
    { month: "May", total: 9834, profit: 6745, loss: 3452 },
    { month: "June", total: 5412, profit: 4983, loss: 8623 },
    { month: "July", total: 7891, profit: 3456, loss: 7290 },
    { month: "August", total: 3058, profit: 8921, loss: 1245 },
    { month: "September", total: 6283, profit: 7634, loss: 5321 },
    { month: "October", total: 4567, profit: 2189, loss: 9034 },
    { month: "November", total: 7348, profit: 5423, loss: 6789 },
    { month: "December", total: 8123, profit: 6781, loss: 3214 },
];

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
                        <p className={styles.value}>{toUSD(payload[1].value)}</p>
                    </div>
                    <div className={styles.tooltipRow}>
                        <p className={styles.title}>Loss</p>
                        <p className={styles.value}>{toUSD(payload[2].value)}</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

const ValueByMonth = () => {
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
