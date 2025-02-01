import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
    keyFile: "./backtest.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = "1SY9Sfzy1n29tTJ2XT4UFeMWuTAZGJMu42hKw5bJ3k0E";

export const writeToSheet = async (values: any) => {
    const range = "Sheet1!A1";
    const valueInputOption = "USER_ENTERED";

    const resource = { values };

    try {
        const res = await sheets.spreadsheets.values.update({ spreadsheetId, range, valueInputOption, resource });
        return res;
    } catch (error) {
        console.error("error", error);
    }
};

export const readSheet = async (token: string) => {
    const range = `${token}!A1:B2`;
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        const rows = res.data.values;
        return rows;
    } catch (err) {
        console.error(err);
    }
};

export const readTheLastDay = async (token: string) => {
    const range = `${token}!A`; // Select date column only
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = res.data.values;
        if (!rows || rows.length === 0) {
            console.log("No data found.");
            return null;
        }

        return rows[rows.length - 1]; // Return the last row
    } catch (err) {
        console.error(err);
    }
};
