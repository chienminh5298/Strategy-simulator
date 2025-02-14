import axios from "axios";

// const SERVER_URL = "http://127.0.0.1:3001";
const GOOGLE_APP_SCRIPT = "https://script.google.com/macros/s/AKfycbziU6vIHge02mZkIVGd0gl7TXt9VYsCowxWDnGi_HzgozmcmydOUDzH-vTPw_x5B9Spbg/exec?";
const AWS_LAMBDA = "https://6zhsyas2r9.execute-api.ap-southeast-1.amazonaws.com/default/Backtest_strategy_update_data";

export const fetchToken = async () => {
    return await axios.get(`${GOOGLE_APP_SCRIPT}action=readTokens`);
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

