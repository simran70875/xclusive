import { useAxios } from "./useAxios";
import { API_PATHS } from "../utils/config";

export interface Brand {
    _id: string;
    Brand: string;
    [key: string]: any; // Optional: to accommodate future fields
}

export const useBrandData = () => {
    const {
        data: brands,
        refetch: getBrands,
        loading: loadingBrands,
        error: errorBrands,
    } = useAxios<Brand[]>({
        url: API_PATHS.BRANDS,
        method: "get",
    });

    return {
        brands,
        getBrands,
        loadingBrands,
        errorBrands,
    };
};
