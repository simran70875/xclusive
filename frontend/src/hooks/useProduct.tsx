import { API_PATHS } from '../utils/config';
import useFetch from './useFetch';

interface Category {
    _id: string;
    image?: string;
    icon?: string;
    Category1?: string;
    Category2?: string;
    "Image Ref"?: string;
    Category1Id?: string;
    Category2Id?: string;
}

export interface ProductType {
    _id: string;
    Code: string;
    Description: string;
    Pack: number;
    rrp: number;
    GrpSupplier: string;
    GrpSupplierCode: string;
    Manufacturer: string;
    ManufacturerCode: string;
    ISPCCombined: number;
    VATCode: number;
    Brand: {
        _id: string,
        Brand: string
    };
    ExtendedCharacterDesc: string;
    CatalogueCopy: string;
    ImageRef: string;
    Style: string;
    Category1: Category;
    Category2: Category;
    Category3: Category;
}

type UseProductsOptions = {
    search?: string;
    page?: number;
    limit?: number;
    category1?: any;
    category2?: any;
    category3?: any;
    brand?: any;
    topSelling?: any;
};

const useProducts = (options: UseProductsOptions = {}) => {
    const {
        search = "",
        page = 1,
        limit = 20,
        category1,
        category2,
        category3,
        brand,
        topSelling = false
    } = options;


    // ✅ Remove undefined values before passing to useFetch
    const queryParams: Record<string, any> = {
        page,
        limit,
        search,
        topSelling
    };

    if (category1) queryParams.category1 = category1;
    if (category2) queryParams.category2 = category2;
    if (category3) queryParams.category3 = category3;
    if (brand) queryParams.brand = brand;

    const {
        data,
        loading: productLoading,
        error,
        total
    } = useFetch<ProductType[]>(API_PATHS.PRODUCTS, queryParams);

    const products = data ?? [];
    const totalPages = Math.ceil(total / limit);

    return {
        products,
        productLoading,
        error,
        total,
        totalPages
    };
};

export default useProducts;
