import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./useAuth";
import toast from "react-hot-toast";

type Method = "get" | "post" | "put" | "delete";

interface UseAxiosOptions {
    method?: Method;
    url: string;
    body?: any;
    config?: any;
    manual?: boolean;
}

interface MetaData {
    limit: number;
    page: number;
    total: number;
}

export const useAxios = <T = any>({
    method = "get",
    url,
    body = null,
    config = {},
    manual = false,
}: UseAxiosOptions) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(!manual);
    const [anotherdata, setAnotherData] = useState<MetaData | null>(null);
    const { adminToken } = useAuth();

    const fetchData = async (overrides?: Partial<UseAxiosOptions>) => {
        setLoading(true);
        try {
            const actualMethod = overrides?.method || method;
            const actualUrl = overrides?.url || url;
            const actualBody = overrides?.body !== undefined ? overrides.body : body;
            const overrideHeaders = overrides?.config?.headers || {};
            const finalHeaders = {
                ...(config?.headers || {}),
                ...overrideHeaders,
                Authorization: adminToken ? `Bearer ${adminToken}` : "",
            };

            const finalConfig = {
                ...config,
                ...overrides?.config,
                headers: finalHeaders,
            };

            let response;

            if (actualMethod === "get") {
                response = await api.get(actualUrl, finalConfig);
            } else if (actualMethod === "delete") {
                response = await api.delete(actualUrl, finalConfig);
            } else {
                response = await api[actualMethod](actualUrl, actualBody, finalConfig);
            }


            setData(response.data?.data);
            setAnotherData({
                limit: response.data?.limit,
                total: response.data?.total,
                page: response.data?.page,
            });
            setError(null);

            if (actualMethod !== "get") {
                toast.success(response.data?.message || "Operation successful");
            }
        } catch (err: any) {
            console.log("error ==> ", error)
            const errMsg = err.response?.data?.message || "Something went wrong";
            setError(errMsg);
            toast.dismiss();
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!manual) {
            fetchData();
        }
    }, [url, JSON.stringify(body)]);

    return { data, error, loading, refetch: fetchData, metaData: anotherdata, };
};
