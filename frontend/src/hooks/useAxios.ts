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
    successMessage?: string;
    errorMessage?: string;
}

export const useAxios = <T = any>({
    method = "get",
    url,
    body = null,
    config = {},
    manual = false,
    successMessage,
    // errorMessage,
}: UseAxiosOptions) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(!manual);
    const { token } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const finalConfig = {
                ...config,
                headers: {
                    ...(config?.headers || {}),
                    Authorization: token ? `Bearer ${token}` : "",
                },
            };

            let response;
            if (method === "get") {
                response = await api.get(url, finalConfig);
            } else {
                response = await api[method](url, body, finalConfig);
            }

            setData(response.data?.data);
            setError(null);

            if (successMessage) {
                toast.success(successMessage);
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || "Something went wrong";
            setError(err.response?.data || err.message);

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

    return { data, error, loading, refetch: fetchData };
};
