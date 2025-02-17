import { toUSD } from "@src/utils";
import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "@src/component/tab/analyse/analyse.module.scss";

const data = [
    { date: "2024-01-07", value: 15342 },
    { date: "2024-01-14", value: 28491 },
    { date: "2024-01-21", value: 7298 },
    { date: "2024-01-28", value: 18205 },
    { date: "2024-02-04", value: 24567 },
    { date: "2024-02-11", value: 14890 },
    { date: "2024-02-18", value: 20789 },
    { date: "2024-02-25", value: 9342 },
    { date: "2024-03-03", value: 27845 },
    { date: "2024-03-10", value: 10562 },
    { date: "2024-03-17", value: 19023 },
    { date: "2024-03-24", value: 23001 },
    { date: "2024-03-31", value: 17589 },
    { date: "2024-04-07", value: 26754 },
    { date: "2024-04-14", value: 8342 },
    { date: "2024-04-21", value: 19487 },
    { date: "2024-04-28", value: 25891 },
    { date: "2024-05-05", value: 11234 },
    { date: "2024-05-12", value: 17382 },
    { date: "2024-05-19", value: 29345 },
    { date: "2024-05-26", value: 15984 },
    { date: "2024-06-02", value: 20789 },
    { date: "2024-06-09", value: 12345 },
    { date: "2024-06-16", value: 26892 },
    { date: "2024-06-23", value: 14567 },
    { date: "2024-06-30", value: 21534 },
    { date: "2024-07-07", value: 8976 },
    { date: "2024-07-14", value: 17689 },
    { date: "2024-07-21", value: 28453 },
    { date: "2024-07-28", value: 13056 },
    { date: "2024-08-04", value: 19384 },
    { date: "2024-08-11", value: 27456 },
    { date: "2024-08-18", value: 15872 },
    { date: "2024-08-25", value: 21459 },
    { date: "2024-09-01", value: 9843 },
    { date: "2024-09-08", value: 17345 },
    { date: "2024-09-15", value: 28973 },
    { date: "2024-09-22", value: 14928 },
    { date: "2024-09-29", value: 20756 },
    { date: "2024-10-06", value: 27584 },
    { date: "2024-10-13", value: 19275 },
    { date: "2024-10-20", value: 24873 },
    { date: "2024-10-27", value: 16589 },
    { date: "2024-11-03", value: 29034 },
    { date: "2024-11-10", value: 10394 },
    { date: "2024-11-17", value: 18752 },
    { date: "2024-11-24", value: 26789 },
    { date: "2024-12-01", value: 15247 },
    { date: "2024-12-08", value: 20938 },
    { date: "2024-12-15", value: 27489 },
    { date: "2024-12-22", value: 13458 },
    { date: "2024-12-29", value: 19672 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltipValueOverTime}>
                <p>{label}</p>
                <p className={styles.value}>{toUSD(payload[0].value)}</p>
            </div>
        );
    }

    return null;
};

const ValueOverTime = () => {
    return (
        <ResponsiveContainer width="90%" height={250}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2897ff" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2897ff" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip content={CustomTooltip} />
                <Area type="monotone" dataKey="value" stroke="#999999" fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default ValueOverTime;
