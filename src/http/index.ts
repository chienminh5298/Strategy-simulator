import axios from "axios";

// const SERVER_URL = "http://127.0.0.1:3001";
const GOOGLE_APP_SCRIPT = "https://script.google.com/macros/s/AKfycbxNcSt0y-3-5owJq0TZphm3reU1v1z33F0c9Zf7p1w4EWZPItN5XZnA_qSf8FcP63pY2Q/exec?";
const AWS_LAMBDA = "https://6zhsyas2r9.execute-api.ap-southeast-1.amazonaws.com/default/Backtest_strategy_update_data";

export const fetchTokenData = async () => {
    return await axios.get(`${GOOGLE_APP_SCRIPT}action=readAll`);
};
export const fetchOneTokenData = async (token: string) => {
    return await axios.get(`${GOOGLE_APP_SCRIPT}action=read&token=${token}`);
};

export const mutationUpdateData = async (token: string, lastDate: string) => {
    try {
        const res = await axios.post(
            AWS_LAMBDA,
            { token, lastDate }, // Send as an object (no need to stringify manually)
            {
                headers: {
                    "Content-Type": "application/json", // Important: Set correct header
                },
            }
        );
        return res.data;
    } catch (error: any) {
        console.error("Error in mutationUpdateData:", error.response ? error.response.data : error.message);
        throw error;
    }
};

