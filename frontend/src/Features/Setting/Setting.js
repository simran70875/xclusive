import { toast } from "react-toastify";
import { createSlice } from "@reduxjs/toolkit";

import { apiUrl } from "../../Constant";
import { apiCall } from "../../Services/CommonService";

const initialState = {
  settingData: null,
  couponCodeData: null,
  allReviewData: null,
  productReviewData: null,
  singleReviewData: null,
  couponData: null,
  settingLoading: false,
};

export const setting = createSlice({
  name: "setting",
  initialState,
  reducers: {
    getSettingData: (state, action) => {
      state.settingData = action.payload;
    },
    getCouponCodeData: (state, action) => {
      state.couponCodeData = action.payload;
    },
    getCouponData: (state, action) => {
      state.couponData = action.payload;
    },
    getAllReviewData: (state, action) => {
      state.allReviewData = action.payload;
    },
    getProductReviewData: (state, action) => {
      state.productReviewData = action.payload;
    },
    getSingleReviewData: (state, action) => {
      state.singleReviewData = action.payload;
    },
    setSettingLoading: (state, action) => {
      state.settingLoading = action.payload;
    },
  },
});
export const {
  getSettingData,
  getCouponCodeData,
  getSettingType,
  getAllReviewData,
  getProductReviewData,
  getSingleReviewData,
  setSettingLoading,
  getCouponData,
} = setting.actions;

export default setting.reducer;

export const getSettingApi = () => (dispatch) => {
  dispatch(setSettingLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getSettingData(response?.Settings));
      dispatch(setSettingLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setSettingLoading(false));
    };
    apiCall("GET", `${apiUrl.GET_ALL_SETTING}`, "", onSuccess, onFailure);
  } catch (error) {
    dispatch(setSettingLoading(false));
  }
};

export const addCouponCodeApi =
  (value, onSuccessCallback, token) => (dispatch) => {
    dispatch(setSettingLoading(true));
    try {
      const onSuccess = (response) => {
        console.log("response coupon" , response);
        onSuccessCallback(response);
        if(response.type === "error"){
          toast.error(response.message);
        } else{
          toast.success(response.message);
        }
       
        dispatch(setSettingLoading(false));
        dispatch(getCouponData(response?.coupon));
      };
      const onFailure = (error) => {
        dispatch(setSettingLoading(false));
      };

      apiCall(
        "POST",
        apiUrl.ADD_COUPON_CODE,
        value,
        onSuccess,
        onFailure,
        token
      );
    } catch (error) {
      dispatch(setSettingLoading(false));
    }
  };

export const getCouponCodeApi = (token) => (dispatch) => {
  dispatch(setSettingLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getCouponCodeData(response?.coupon));
      dispatch(setSettingLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setSettingLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_COUPON_CODE}`,
      "",
      onSuccess,
      onFailure,
      token
    );
  } catch (error) {
    dispatch(setSettingLoading(false));
  }
};

export const addReviewApi = (value, onSuccessCallback, token) => (dispatch) => {
  dispatch(setSettingLoading(true));
  try {
    const onSuccess = (response) => {
      onSuccessCallback(response);
      dispatch(setSettingLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setSettingLoading(false));
    };

    apiCall("POST", apiUrl.ADD_REVIEW, value, onSuccess, onFailure, token);
  } catch (error) {
    dispatch(setSettingLoading(false));
  }
};

export const getSingleReviewApi = (id, token) => (dispatch) => {
  dispatch(setSettingLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getSingleReviewData(response?.reviews));
      dispatch(setSettingLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setSettingLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_SINGLE_REVIEW}/${id}`,
      "",
      onSuccess,
      onFailure,
      token
    );
  } catch (error) {
    dispatch(setSettingLoading(false));
  }
};

export const getAllReviewApi = () => (dispatch) => {
  dispatch(setSettingLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getAllReviewData(response?.reviews));
      dispatch(setSettingLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setSettingLoading(false));
    };
    apiCall("GET", `${apiUrl.GET_ALL_REVIEW}`, "", onSuccess, onFailure);
  } catch (error) {
    dispatch(setSettingLoading(false));
  }
};

export const getProductReviewApi = (id, token) => (dispatch) => {
  dispatch(setSettingLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getProductReviewData(response?.reviews));
      dispatch(setSettingLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setSettingLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_PRODUCT_REVIEW}/${id}`,
      "",
      onSuccess,
      onFailure,
      token
    );
  } catch (error) {
    dispatch(setSettingLoading(false));
  }
};
