import { toast } from "react-toastify";
import { createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "../../Constant";
import { apiCall } from "../../Services/CommonService";

const tokenFromStorage = localStorage.getItem("token");

const initialState = {
  token: tokenFromStorage || "",
  userId: null,
  profileData: null,
  userName: null,
  cartCount: 0,
  likeCount: 0,
  isLoginLoading: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      return initialState;
    },
    setUserID: (state, action) => {
      state.userId = action.payload;
    },
    getProfileData: (state, action) => {
      state.profileData = action.payload;
    },
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
    setIsLoginLoading: (state, action) => {
      state.isLoginLoading = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setCartCount: (state, action) => {
      state.cartCount = action.payload;
    },
    setLikeCount: (state, action) => {
      state.likeCount = action.payload;
    },
  },
});

export const {
  setCartCount,
  setUserID,
  getProfileData,
  setUserName,
  logout,
  setToken,
  setLikeCount,
  setIsLoginLoading,
  setSideBarIndex,
} = userSlice.actions;

export default userSlice.reducer;

export const getProfileApi = (token) => (dispatch) => {
  dispatch(setIsLoginLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getProfileData(response?.user));
      dispatch(setIsLoginLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsLoginLoading(false));
    };
    apiCall("GET", `${apiUrl.GET_PROFILE}`, "", onSuccess, onFailure, token);
  } catch (error) {
    dispatch(setIsLoginLoading(false));
  }
};

export const updateProfileApi = (value, token, onSuccessCallback) => (dispatch) => {
  dispatch(setIsLoginLoading(true));
  try {
    const onSuccess = (res) => {
      // console.log("res",res);
      toast.success(res?.message);
      onSuccessCallback(res);
      dispatch(getProfileApi(token));
      dispatch(setIsLoginLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setIsLoginLoading(false));
    };

    apiCall(
      "PATCH",
      `${apiUrl.UPDATE_PROFILE}`,
      value,
      onSuccess,
      onFailure,
      token
    );
  } catch (error) {
    dispatch(setIsLoginLoading(false));
  }
};

