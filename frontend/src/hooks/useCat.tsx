import { API_PATHS } from '../utils/config'
import useFetch from './useFetch';

export interface CategoryType {
    _id: string;
    Category1: string;
    icon: string;
    image: string;
    Categories2: {
        _id: string;
        label: string;
        Categories3: {
            _id: string;
            Category3: string;
        }[];
    }[];
    allCategories3: {
        _id: string;
        Category3: string;
    }[];
}


const useCategories = (feature?: string) => {
    const url = feature === "Top" ? API_PATHS.TOP_CATEGORIES : API_PATHS.CATEGORIES;
    const { data, loading, error } = useFetch<CategoryType[]>(url);


    // const sortedCategories = (data ?? []).map((category) => {
    //     const sortedCategories2 = [...category.Categories2].sort(
    //         (a, b) => (b.Categories3?.length || 0) - (a.Categories3?.length || 0)
    //     );

    //     return {
    //         ...category,
    //         Categories2: sortedCategories2,
    //     };
    // });


    const categories = data || [];
    const categoryLoading = loading;
    const categoryError = error;

    return { categories, categoryLoading, categoryError };
};


export default useCategories;