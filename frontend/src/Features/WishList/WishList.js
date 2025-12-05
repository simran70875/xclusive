import { toast } from "react-toastify";
import { createSlice } from "@reduxjs/toolkit";

import { apiUrl } from "../../Constant";
import { apiCall } from "../../Services/CommonService";

const initialState = {
  wishlist: null,
  wishlist2: 0,
  wishListLoading: false,
};

export const wishList = createSlice({
  name: "wishList",
  initialState,
  reducers: {
    getWishList: (state, action) => {
      state.wishlist = action.payload;
    },
    getWishList2: (state, action) => {
      state.wishlist2 = action.payload;
    },
    setWishListLoading: (state, action) => {
      state.wishListLoading = action.payload;
    },
  },
});
export const { getWishList, getWishList2, setWishListLoading } =
  wishList.actions;

export default wishList.reducer;

export const addWishList = (value, onSuccessCallback, token) => (dispatch) => {
  dispatch(setWishListLoading(true));
  try {
    const onSuccess = (response) => {
      toast.success(response?.message);
      onSuccessCallback(response);
      dispatch(setWishListLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setWishListLoading(false));
    };

    apiCall("POST", apiUrl.ADD_WISH_LIST, value, onSuccess, onFailure, token);
  } catch (error) {
    dispatch(setWishListLoading(false));
  }
};

export const getWishListApi = (token) => (dispatch) => {
  dispatch(setWishListLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getWishList(response?.wishlist));
      dispatch(getWishList2(response?.Count));
      dispatch(setWishListLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setWishListLoading(false));
    };
    apiCall("GET", `${apiUrl.GET_WISH_LIST}`, "", onSuccess, onFailure, token);
  } catch (error) {
    dispatch(setWishListLoading(false));
  }
};
