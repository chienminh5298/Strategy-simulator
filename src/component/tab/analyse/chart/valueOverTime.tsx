import { toUSD } from "@src/utils";
import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "@src/component/tab/analyse/analyse.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

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
    const data = useSelector((state: RootState) => state.chartConfig.analyse.ValueOverTimeChart);

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
