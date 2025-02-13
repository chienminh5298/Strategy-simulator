export function convertToUTCDateTime(isoString: string) {
    // Create a Date object from the ISO string
    const date = new Date(isoString);

    // Format the date and time in UTC (YYYY-MM-DD HH:MM:SS)
    const utcDateTime = date.getUTCFullYear() + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0") + " " + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0") + ":" + String(date.getUTCSeconds()).padStart(2, "0");

    return utcDateTime;
}

export const toUSD = (value: number | string = 0, sign: boolean = true, maximumFractionDigits: number = 2): string => {
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        signDisplay: value === 0 || !sign ? "never" : "always",
        minimumFractionDigits: 2,
        maximumFractionDigits: maximumFractionDigits,
    });
};