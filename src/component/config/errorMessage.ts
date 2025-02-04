export const errorMessage = (type: "token" | "year" | "value" | "strategy" | "triggerStrategy") => {
    let response;
    switch (type) {
        case "token":
            response = "Please select a token";
            break;
        case "year":
            response = "Please select a year";
            break;
        case "value":
            response = "Value can't less than 500$";
            break;
        case "strategy":
        case "triggerStrategy":
            response = "A good strategy should have at least 2 stoplosses. The first stoploss is set at your entry with target percent = 0 and the last stoploss is set when you want to take profit. Example: If you want target hit 3% then take profit, you should set target = 3 and percent = 3. And target is unique.";
            break;
        default:
            response = "Percent always less than target. Example: If target hit 3% you can't take profit at 4% (target = 3, percent = 4). The maximum profit percent you can take is 3%.";
    }

    return response;
};
