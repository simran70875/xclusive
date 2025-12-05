import { createSlice } from "@reduxjs/toolkit";

import { apiUrl } from "../../Constant";
import { apiCall } from "../../Services/CommonService";

const initialState = {
  categoryData: null,
  categoryFeatureData: null,
  categoryLoading: false,
};

export const category = createSlice({
  name: "category",
  initialState,
  reducers: {
    getCategoryData: (state, action) => {
      state.categoryData = action.payload;
    },
    getCategoryFeatureData: (state, action) => {
      state.categoryFeatureData = action.payload;
    },
    setCategoryLoading: (state, action) => {
      state.categoryLoading = action.payload;
    },
  },
});
export const { getCategoryData, getCategoryFeatureData, setCategoryLoading } =
  category.actions;

export default category.reducer;

export const getCategoryApi = () => (dispatch) => {
  dispatch(setCategoryLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getCategoryData(response?.category));
      dispatch(setCategoryLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setCategoryLoading(false));
    };

    apiCall("GET", `${apiUrl.GET_MOB_CATEGORY}`, "", onSuccess, onFailure);
  } catch (error) {
    dispatch(setCategoryLoading(false));
  }
};

export const getCategoryFeatureApi = () => (dispatch) => {
  dispatch(setCategoryLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getCategoryFeatureData(response?.category));
      dispatch(setCategoryLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setCategoryLoading(false));
    };

    apiCall(
      "GET",
      `${apiUrl.GET_MOB_FEATURE_CATEGORY}`,
      "",
      onSuccess,
      onFailure
    );
  } catch (error) {
    dispatch(setCategoryLoading(false));
  }
};
