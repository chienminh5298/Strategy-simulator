import axios from "axios";

// const SERVER_URL = "http://127.0.0.1:3001";
const SERVER_URL = "https://script.google.com/macros/s/AKfycbx9lA-N_NTgD1UPfXhUEJZwdaHlb4UT-qQ12kN8VYjOtuHPXwI8BQFemAd6uE9E3ZrGKA/exec?";

export const fetchTokenData = async () => {
    return await axios.get(`${SERVER_URL}action=readAll`);
};
export const fetchOneTokenData = async (token: string) => {
    return await axios.get(`${SERVER_URL}action=read&token=${token}`);
};

export const mutationUpdateData = async (token: string, lastDate: string) => {
    const res = await axios.post(`${SERVER_URL}`, JSON.stringify({ token, lastDate }), {
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
    });
    return res;
};
