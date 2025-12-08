import { type CartItem } from '../pages/cartPage';
import { API_PATHS } from '../utils/config'
import { getUserId } from '../utils/createGuestUserId';
import useFetch from './useFetch';

const useCart = () => {
    const userId = getUserId();
    const { data, fetchData, loading, error } = useFetch<{ _id: string; userId: string; items: CartItem[] }[]>(API_PATHS.GET_CART, { userId });

    const cartdata = data || [];
    const cartLoading = loading;
    const cartError = error;

    return { cartdata, fetchData, cartLoading, cartError };
};


export default useCart;