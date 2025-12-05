import { createSlice } from "@reduxjs/toolkit";

import { apiUrl } from "../../Constant";
import { apiCall } from "../../Services/CommonService";

const initialState = {
  addressData: null,
  notificationData: null,
  isAddressLoading: false,
};

export const walletCoins = createSlice({
  name: "walletCoins",
  initialState,
  reducers: {
    getWalletData: (state, action) => {
      state.walletData = action.payload;
    },
    getCoinsData: (state, action) => {
      state.coinsData = action.payload;
    },
    getNotificationData: (state, action) => {
      state.notificationData = action.payload;
    },
    setIsWalletCoinLoading: (state, action) => {
      state.walletCoinLoading = action.payload;
    },
  },
});
export const {
  getWalletData,
  getCoinsData,
  getNotificationData,
  setIsWalletCoinLoading,
} = walletCoins.actions;

export default walletCoins.reducer;

export const getWalletApi = (token) => (dispatch) => {
  dispatch(setIsWalletCoinLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getWalletData(response?.wallet));
      dispatch(setIsWalletCoinLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsWalletCoinLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_WALLET_HISTORY}`,
      "",
      onSuccess,
      onFailure,
      token
    );
  } catch (error) {
    dispatch(setIsWalletCoinLoading(false));
  }
};

export const getCoinsApi = (token) => (dispatch) => {
  dispatch(setIsWalletCoinLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getCoinsData(response?.coins));
      dispatch(setIsWalletCoinLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsWalletCoinLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_COINS_HISTORY}`,
      "",
      onSuccess,
      onFailure,
      token
    );
  } catch (error) {
    dispatch(setIsWalletCoinLoading(false));
  }
};

export const getNotificationApi = (token) => (dispatch) => {
  dispatch(setIsWalletCoinLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getNotificationData(response?.notificationList));
      dispatch(setIsWalletCoinLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsWalletCoinLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_NOTIFICATION}`,
      "",
      onSuccess,
      onFailure,
      token
    );
  } catch (error) {
    dispatch(setIsWalletCoinLoading(false));
  }
};
