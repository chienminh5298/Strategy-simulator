import { useQuery } from "@tanstack/react-query";
import { fetchTokenDataByYear } from "@src/http";

function useFetchYearData({ token, year }: { token: string; year: string | number }) {
    return useQuery({
        queryKey: ["data", token, year],
        queryFn: () => fetchTokenDataByYear(token, year),
        enabled: false, // ensures the query only runs when token and year are provided
    });
}

export default useFetchYearData;
