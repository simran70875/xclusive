import { toast } from "react-toastify";
import { createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "../../Constant";
import { apiCall } from "../../Services/CommonService";

const initialState = {
  allOrderData: null,
  cancelOrderData: null,
  isAddressLoading: false,
};

export const order = createSlice({
  name: "order",
  initialState,
  reducers: {
    getAllOrder: (state, action) => {
      state.allOrderData = action.payload;
    },
    getCancelOrder: (state, action) => {
      state.cancelOrderData = action.payload;
    },
    setIsOrderLoading: (state, action) => {
      state.isOrderLoading = action.payload;
    },
  },
});

export const { getAllOrder, getCancelOrder, setIsOrderLoading } = order.actions;
export default order.reducer;

export const addOrderApi = (value, onSuccessCallback, token) => (dispatch) => {
  dispatch(setIsOrderLoading(true));
  try {
    const onSuccess = (response) => {
      onSuccessCallback(response);
      dispatch(setIsOrderLoading(false));
    };
    const onFailure = (error) => {
      toast.error(error.message);
      dispatch(setIsOrderLoading(false));

    };
    apiCall("POST", apiUrl.ADD_ORDER, value, onSuccess, onFailure, token);
  } catch (error) {
    dispatch(setIsOrderLoading(false));
  }
};

export const getAllOrderApi = (token) => (dispatch) => {
  dispatch(setIsOrderLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getAllOrder(response?.orderList));
      dispatch(setIsOrderLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsOrderLoading(false));
    };
    apiCall("GET", `${apiUrl.GET_ALL_ORDER}`, "", onSuccess, onFailure, token);
  } catch (error) {
    dispatch(setIsOrderLoading(false));
  }
};

export const updateOrderApi =
  (value, token, id, onSuccessCallback) => (dispatch) => {
    dispatch(setIsOrderLoading(true));
    try {
      const onSuccess = (res) => {
        toast.success(res?.message);
        onSuccessCallback(res);
        dispatch(getAllOrderApi(token));
        dispatch(setIsOrderLoading(false));
      };
      const onFailure = (error) => {
        dispatch(setIsOrderLoading(false));
      };

      apiCall(
        "PATCH",
        `${apiUrl.UPDATE_ORDER}/${id}`,
        value,
        onSuccess,
        onFailure,
        token
      );
    } catch (error) {
      dispatch(setIsOrderLoading(false));
    }
};

export const getSingleOrderApi = (id, token) => (dispatch) => {
  dispatch(setIsOrderLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getCancelOrder(response?.orderList));
      dispatch(setIsOrderLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsOrderLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.SINGLE_ORDER_ID}/${id}`,
      "",
      onSuccess,
      onFailure,
      token
    );
  } catch (error) {
    dispatch(setIsOrderLoading(false));
  }
};
