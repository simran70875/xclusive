import { toast } from "react-toastify";
import { createSlice } from "@reduxjs/toolkit";

import { apiUrl } from "../../Constant";
import { apiCall, deleteApi } from "../../Services/CommonService";

const initialState = {
  addressData: null,
  isAddressLoading: false,
};

export const address = createSlice({
  name: "address",
  initialState,
  reducers: {
    getAddressData: (state, action) => {
      state.addressData = action.payload;
    },
    setIsAddressLoading: (state, action) => {
      state.isAddressLoading = action.payload;
    },
  },
});
export const { getAddressData, setIsAddressLoading } = address.actions;

export default address.reducer;

export const addAddressApi =
  (value, token, onSuccessCallback) => (dispatch) => {
    dispatch(setIsAddressLoading(true));
    try {
      const onSuccess = (response) => {
        toast.success(response?.message);
        onSuccessCallback(response);
        dispatch(setIsAddressLoading(false));
      };
      const onFailure = (error) => {
        dispatch(setIsAddressLoading(false));
      };
      apiCall("POST", apiUrl.ADD_ADDRESS, value, onSuccess, onFailure, token);
    } catch (error) {
      dispatch(setIsAddressLoading(false));
    }
  };

export const geAddressApi = (token) => (dispatch) => {
  dispatch(setIsAddressLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getAddressData(response?.address));
      dispatch(setIsAddressLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsAddressLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_ALL_ADDRESS}`,
      "",
      onSuccess,
      onFailure,
      token
    );
  } catch (error) {
    dispatch(setIsAddressLoading(false));
  }
};

export const updateAddressApi =
  (value, token, id, onSuccessCallback) => (dispatch) => {
    dispatch(setIsAddressLoading(true));
    try {
      const onSuccess = (res) => {
        toast.success(res?.message);
        onSuccessCallback(res);
        dispatch(geAddressApi(token));
        dispatch(setIsAddressLoading(false));
      };
      const onFailure = (error) => {
        dispatch(setIsAddressLoading(false));
      };

      apiCall(
        "PATCH",
        `${apiUrl.UPDATE_ADDRESS}/${id}`,
        value,
        onSuccess,
        onFailure,
        token
      );
    } catch (error) {
      dispatch(setIsAddressLoading(false));
    }
  };

export const deleteAddressApi = (id, token) => (dispatch) => {
  dispatch(setIsAddressLoading(true));

  if (token) {
    const onSuccess = (response) => {
      toast.success(response?.message);
      dispatch(geAddressApi(token));
    };
    const url = `${apiUrl.DELETE_ADDRESS}/${id}`;

    deleteApi(url, onSuccess, token);
  }
};
