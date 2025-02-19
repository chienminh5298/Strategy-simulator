import React, { ReactNode } from "react";
import styles from "@src/component/needHelp/index.module.scss";

interface NeedHelpProps {
    children: ReactNode;
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "middle-right" | "middle-left";
}

const NeedHelp: React.FC<NeedHelpProps> = ({ children, position }) => {
    let className;
    switch (position) {
        case "top-right":
            className = styles.top_right;
            break;
        case "top-left":
            className = styles.top_left;
            break;
        case "bottom-right":
            className = styles.bottom_right;
            break;
        case "middle-right":
            className = styles.middle_right;
            break;
        default:
            className = styles.bottom_left;
    }
    return <div className={`${styles.helpContainer} ${className}`}>{children}</div>;
};

export default NeedHelp;
