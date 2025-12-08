import { useMemo } from "react";
import { useAxios } from "../hooks/useAxios";
import { API_PATHS } from "../utils/config";
import { Product } from "../types/product";

export interface PaginationModel {
  page?: number;
  pageSize?: number;
}

interface UseProductListProps {
  searchQuery?: string;
  paginationModel?: PaginationModel;
}

export const useProductList = ({ searchQuery = "", paginationModel = {} }: UseProductListProps = {}) => {
  const { page, pageSize} = paginationModel;

  const query = useMemo(() => {
    const params: Record<string, string> = {};

    if (searchQuery) params.search = searchQuery;
    if (page !== undefined) params.page = (page + 1).toString(); // 1-based index
    if (pageSize !== undefined) params.limit = pageSize.toString();

    return new URLSearchParams(params).toString();
  }, [searchQuery, page, pageSize]);

  const { data, metaData, loading, error, refetch } = useAxios<Product[]>({
    url: `${API_PATHS.PRODUCTS}?${query}`,
  });

  return {
    productData: data || [],
    metaData,
    loading,
    error,
    refetch,
  };
};
