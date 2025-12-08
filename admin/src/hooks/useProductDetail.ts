// hooks/useProductDetail.ts
import { useEffect } from "react";
import { useAxios } from "./useAxios";
import { API_PATHS } from "../utils/config";

export const useProductDetail = (productId: string | null) => {
  const {
    data,
    error,
    loading,
    refetch,
  } = useAxios({
    url: productId ? API_PATHS.GET_PRODUCT + "/" + productId  : "",
    method: "get",
    manual: true,
  });

  useEffect(() => {
    if (productId) {
      refetch();
    }
  }, [productId]);

  return { product: data, loading, error };
};
