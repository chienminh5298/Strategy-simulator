import { configType } from "@src/component/config";
import { candleType } from "@src/redux/dataReducer";

export function convertToUTCDateTime(isoString: string) {
    // Create a Date object from the ISO string
    const date = new Date(isoString);

    // Format the date and time in UTC (YYYY-MM-DD HH:MM:SS)
    const utcDateTime = date.getUTCFullYear() + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0") + " " + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0") + ":" + String(date.getUTCSeconds()).padStart(2, "0");

    return utcDateTime;
}

const backtestLogic = (config: configType, data: candleType[]) => {};

const checkIsMidNight = (UTCstring: string) => {
    const date = new Date(UTCstring);
    return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
};
