import { toast } from "react-toastify";
import { createSlice } from "@reduxjs/toolkit";

import { apiUrl } from "../../Constant";
import { apiCall, deleteApi } from "../../Services/CommonService";

const initialState = {
  cartListData: null,
  paymentData: 0,
  isAddCartLoad: false,
};

export const addCart = createSlice({
  name: "addCart",
  initialState,
  reducers: {
    getCartListData: (state, action) => {
      state.cartListData = action.payload;
    },
    getPaymentData: (state, action) => {
      state.paymentData = action.payload;
    },
    setIsAddCartLoading: (state, action) => {
      state.isAddCartLoad = action.payload;
    },
  },
});
export const { getCartListData, getPaymentData, setIsAddCartLoading } =
  addCart.actions;

export default addCart.reducer;

export const addCartApi = (value, onSuccessCallback, token) => (dispatch) => {
  dispatch(setIsAddCartLoading(true));
  try {
    const onSuccess = (response) => {
      toast.success(response?.message);
      onSuccessCallback(response);
      dispatch(setIsAddCartLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsAddCartLoading(false));
    };

    apiCall("POST", apiUrl.ADD_TO_CART, value, onSuccess, onFailure, token);
  } catch (error) {
    dispatch(setIsAddCartLoading(false));
  }
};

export const geCartListApi = (token) => (dispatch) => {
  dispatch(setIsAddCartLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getCartListData(response));
      dispatch(setIsAddCartLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsAddCartLoading(false));
    };
    apiCall("GET", `${apiUrl.GET_CART_LIST}`, "", onSuccess, onFailure, token);
  } catch (error) {
    dispatch(setIsAddCartLoading(false));
  }
};

export const editCartApi =
  (value, token, id, onSuccessCallback) => (dispatch) => {
    dispatch(setIsAddCartLoading(true));
    try {
      const onSuccess = (res) => {
        toast.success(res?.message);
        onSuccessCallback(res);
        dispatch(setIsAddCartLoading(false));
      };
      const onFailure = (error) => {
        dispatch(setIsAddCartLoading(false));
      };

      apiCall(
        "PUT",
        `${apiUrl.PUT_CART_LIST}/${id}`,
        value,
        onSuccess,
        onFailure,
        token
      );
    } catch (error) {
      dispatch(setIsAddCartLoading(false));
    }
  };

export const deleteCartListApi = (id, token) => (dispatch) => {
  dispatch(setIsAddCartLoading(true));

  if (token) {
    const onSuccess = (response) => {
      toast.success(response?.message);
      dispatch(geCartListApi(token));
    };
    const url = `${apiUrl.DELETE_CART_LIST}/${id}`;

    deleteApi(url, onSuccess, token);
  }
};

export const deleteaLLCartListApi = (token) => (dispatch) => {
  dispatch(setIsAddCartLoading(true));

  if (token) {
    const onSuccess = (response) => {
      toast.success(response?.message);
      dispatch(geCartListApi(token));
    };
    const url = `${apiUrl.DELETE_ALL_CART_LIST}`;

    deleteApi(url, onSuccess, token);
  }
};

export const getPaymentApi = (amounts) => (dispatch) => {
  dispatch(setIsAddCartLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getPaymentData(response));
      dispatch(setIsAddCartLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsAddCartLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_PAYMENT_GETWAY}?amounts=${amounts}`,
      "",
      onSuccess,
      onFailure
    );
  } catch (error) {
    dispatch(setIsAddCartLoading(false));
  }
};
