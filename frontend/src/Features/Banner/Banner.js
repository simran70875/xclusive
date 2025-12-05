import { createSlice } from "@reduxjs/toolkit";

import { apiUrl } from "../../Constant";
import { apiCall } from "../../Services/CommonService";

const initialState = {
  bannerData: null,
  bannerProductData: null,
  bannerLoading: false,
};

export const banner = createSlice({
  name: "banner",
  initialState,
  reducers: {
    getBannerData: (state, action) => {
      state.bannerData = action.payload;
    },
    getBannerProducteData: (state, action) => {
      state.bannerProductData = action.payload;
    },
    setBannerLoading: (state, action) => {
      state.bannerLoading = action.payload;
    },
  },
});
export const { getBannerData, getBannerProducteData, setBannerLoading } =
  banner.actions;

export default banner.reducer;

export const getBannerApi = () => (dispatch) => {
  dispatch(setBannerLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getBannerData(response?.banner));
      dispatch(setBannerLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setBannerLoading(false));
    };
    apiCall("GET", `${apiUrl.GET_BANNER}`, "", onSuccess, onFailure);
  } catch (error) {
    dispatch(setBannerLoading(false));
  }
};

export const getBannerProductApi = () => (dispatch) => {
  dispatch(setBannerLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getBannerProducteData(response?.banner));
      dispatch(setBannerLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setBannerLoading(false));
    };

    apiCall("GET", `${apiUrl.GET_BANNER_PRODUCT}`, "", onSuccess, onFailure);
  } catch (error) {
    dispatch(setBannerLoading(false));
  }
};
