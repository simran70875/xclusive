import { useMemo } from "react";
import { useAxios } from "../hooks/useAxios";
import { API_PATHS } from "../utils/config";
import { User } from "../types/auth";


export interface PaginationModel {
  page?: number;
  pageSize?: number;
}

interface UseProductListProps {
  searchQuery?: string;
  paginationModel?: PaginationModel;
}

export const useCustomerList = ({ searchQuery = "", paginationModel = {} }: UseProductListProps = {}) => {
  const { page, pageSize} = paginationModel;

  const query = useMemo(() => {
    const params: Record<string, string> = {};

    if (searchQuery) params.search = searchQuery;
    if (page !== undefined) params.page = (page + 1).toString(); // 1-based index
    if (pageSize !== undefined) params.limit = pageSize.toString();

    return new URLSearchParams(params).toString();
  }, [searchQuery, page, pageSize]);

  const { data, metaData, loading, error, refetch } = useAxios<User[]>({
    url: `${API_PATHS.USERS}?${query}`,
  });

  return {
    userData: data || [],
    metaData,
    loading,
    error,
    refetch,
  };
};
