import React from "react";
import { Legend, Pie, PieChart, Tooltip, Treemap } from "recharts";
const data = [
    {
        name: "Strategy",
        children: [
            {
                target: "Target 0 ",
                hit: 50,
            },
            {
                target: "Target 1 ",
                hit: 40,
            },
            {
                target: "Target 2 ",
                hit: 30,
            },
            {
                target: "Target 3 ",
                hit: 10,
            },
        ],
    },
    {
        name: "Trigger strategy",
        children: [
            {
                target: "Target 0 ",
                hit: 80,
            },
            {
                target: "Target 1 ",
                hit: 30,
            },
            {
                target: "Target 2 ",
                hit: 30,
            },
            {
                target: "Target 3 ",
                hit: 10,
            },
        ],
    },
];

const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
        <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
            {payload.map((entry, index) => (
                <li key={`item-${index}`} style={{ marginBottom: 5 }}>
                    <span
                        style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            backgroundColor: entry.color,
                            marginRight: 10,
                            borderRadius: "50%",
                        }}
                    ></span>
                    {entry.value}
                </li>
            ))}
        </ul>
    );
};

const WinLoss = () => {
    return (
        <Treemap
            width={730}
            height={250}
            data={data}
            dataKey="hit"
            nameKey="target"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            label // This enables labels on each block
        />
    );
};

export default WinLoss;
