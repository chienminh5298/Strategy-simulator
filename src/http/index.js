import axios from "axios";

export const fetchTokenData = async () => {
    return await axios.get("http://127.0.0.1:3001/data");
};
