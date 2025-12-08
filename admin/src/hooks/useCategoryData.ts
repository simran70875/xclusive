// src/hooks/useCategoryData.ts

import { useEffect } from "react";
import { useAxios } from "./useAxios";
import { API_PATHS } from "../utils/config";

export interface CategoryType {
    _id: string;
    Category1: string;
    Category2: string;
    Category3: string;
    [key: string]: any; // Extend if needed
}

export const useCategoryData = (selectedTopCategoryId?: string, selectedSubCategoryId?: string) => {
    // Get all top-level categories
    const {
        data: categories,
        refetch,
        loading: loadingCategories,
    } = useAxios<CategoryType[]>({
        url: API_PATHS.CATEGORIES,
        method: "get",
    });

    // Get all sub-categories (Category2)
    const {
        data: subCategories,
        refetch: subCategoriesRefetch,
        loading: loadingSubCategories,
    } = useAxios<CategoryType[]>({
        url: selectedTopCategoryId
            ? `${API_PATHS.SUB_CATEGORIES}?Category1=${selectedTopCategoryId}`
            : API_PATHS.SUB_CATEGORIES,
        method: "get",
    });

    // Get all sub-child categories (Category3)
    const {
        data: subChildCategories,
        refetch: subChildCategoriesRefetch,
        loading: loadingSubChildCategories,
    } = useAxios<CategoryType[]>({
        url: selectedSubCategoryId
            ? `${API_PATHS.SUB_CHILD_CATEGORIES}?Category2=${selectedSubCategoryId}`
            : API_PATHS.SUB_CHILD_CATEGORIES,
        method: "get",
    });

    // Refetch when dependencies change
    useEffect(() => {
        if (selectedTopCategoryId) {
            subCategoriesRefetch();
        }
    }, [selectedTopCategoryId]);

    useEffect(() => {
        if (selectedSubCategoryId) {
            subChildCategoriesRefetch();
        }
    }, [selectedSubCategoryId]);

    return {
        categories,
        subCategories,
        subChildCategories,
        loadingCategories,
        loadingSubCategories,
        loadingSubChildCategories,
        refetch,
        subCategoriesRefetch,
        subChildCategoriesRefetch,
    };
};
