import { toast } from "react-toastify";
import { createSlice } from "@reduxjs/toolkit";

import { apiUrl } from "../../Constant";
import { apiCall } from "../../Services/CommonService";

const initialState = {
  productAllData: null,
  productIdData: null,
  productList: null,
  productList1: null,
  productList2: null,
  productList3: null,
  productFeatureList: null,
  productFeatureListLike: null,
  catagoryName: null,
  filterProduct: [],
  filterList: null,
  filterProduct2: null,
  searchData: null,
  productLoading: false,
};

export const product = createSlice({
  name: "product",
  initialState,
  reducers: {
    getProductAllData: (state, action) => {
      state.productAllData = action.payload;
    },
    getCatagoryName: (state, action) => {
      state.catagoryName = action.payload;
    },
    getProductIdData: (state, action) => {
      state.productIdData = action.payload;
    },
    getProductListData: (state, action) => {
      state.productList = action.payload;
    },
    getProductListData1: (state, action) => {
      state.productList1 = action.payload;
    },
    getProductListData2: (state, action) => {
      state.productList2 = action.payload;
    },
    getProductListData3: (state, action) => {
      state.productList3 = action.payload;
    },
    getProductFeatutreListData: (state, action) => {
      state.productFeatureList = action.payload;
    },
    getProductFeatutreListLikeData: (state, action) => {
      state.productFeatureListLike = action.payload;
    },
    getFilterProductData: (state, action) => {
      state.filterProduct = action.payload;
    },
    getFilterProductData2: (state, action) => {
      state.filterProduct2 = action.payload;
    },
    getFilterListData: (state, action) => {
      state.filterList = action.payload;
    },
    getSearchData: (state, action) => {
      state.searchData = action.payload;
    },
    setProductLoading: (state, action) => {
      state.productLoading = action.payload;
    },
  },
});
export const {
  getProductAllData,
  getProductIdData,
  getCatagoryName,
  getProductListData,
  getProductListData1,
  getProductListData2,
  getProductListData3,
  getProductFeatutreListData,
  getProductFeatutreListLikeData,
  getFilterProductData,
  getFilterListData,
  setProductLoading,
  getSearchData,
  getFilterProductData2,
} = product.actions;

export default product.reducer;

export const productNotifyApi =
  (value, onSuccessCallback, token) => (dispatch) => {
    dispatch(setProductLoading(true));
    try {
      const onSuccess = (response) => {
        toast.success(response?.message);
        onSuccessCallback(response);
        dispatch(setProductLoading(false));
      };
      const onFailure = (error) => {
        dispatch(setProductLoading(false));
      };

      apiCall(
        "POST",
        apiUrl.ADD_PRODUCT_NOTIFY,
        value,
        onSuccess,
        onFailure,
        token
      );
    } catch (error) {
      dispatch(setProductLoading(false));
    }
  };

export const getProductAllApi = (catagoryId) => (dispatch) => {
  dispatch(setProductLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getProductAllData(response?.products));
      dispatch(getCatagoryName(response?.products?.[0]?.Category));
      dispatch(setProductLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setProductLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_ALL_PRODUCT}/${catagoryId}`,
      "",
      onSuccess,
      onFailure
    );
  } catch (error) {
    dispatch(setProductLoading(false));
  }
};

export const getProductIdApi = (id, userId) => (dispatch) => {
  dispatch(setProductLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getProductIdData(response?.products));
      dispatch(setProductLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setProductLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_SINGLE_PRODUCT_ID}/${id}?userId=${userId}`,
      "",
      onSuccess,
      onFailure
    );
  } catch (error) {
    dispatch(setProductLoading(false));
  }
};

export const getProductFeatureListApi = (userId) => (dispatch) => {
  dispatch(setProductLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getProductListData(response?.products));
      dispatch(setProductLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setProductLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_FEATURE_LIST}?HomeFeatures=${0}&userId=${userId}`,
      "",
      onSuccess,
      onFailure
    );
  } catch (error) {
    dispatch(setProductLoading(false));
  }
};

export const getProductFeatureListApi1 = (userId) => (dispatch) => {
  dispatch(setProductLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getProductListData1(response?.products));
      dispatch(setProductLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setProductLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_FEATURE_LIST}?HomeFeatures=${1}&userId=${userId}`,
      "",
      onSuccess,
      onFailure
    );
  } catch (error) {
    dispatch(setProductLoading(false));
  }
};

export const getProductFeatureListApi2 = (userId) => (dispatch) => {
  dispatch(setProductLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getProductListData2(response?.products));
      dispatch(setProductLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setProductLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_FEATURE_LIST}?HomeFeatures=${2}&userId=${userId}`,
      "",
      onSuccess,
      onFailure
    );
  } catch (error) {
    dispatch(setProductLoading(false));
  }
};

export const getProductFeatureListApi3 = (userId) => (dispatch) => {
  dispatch(setProductLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getProductListData3(response?.products));
      dispatch(setProductLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setProductLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_FEATURE_LIST}?HomeFeatures=${3}&userId=${userId}`,
      "",
      onSuccess,
      onFailure
    );
  } catch (error) {
    dispatch(setProductLoading(false));
  }
};

export const getProductListApi =
  (catagoryId, userId, productId) => (dispatch) => {
    dispatch(setProductLoading(true));
    try {
      const onSuccess = (response) => {
        dispatch(getProductFeatutreListData(response?.SimilarProducts));
        dispatch(getProductFeatutreListLikeData(response?.YouMayAlsoLike));
        dispatch(setProductLoading(false));
      };
      const onFailure = (error) => {
        dispatch(setProductLoading(false));
      };
      apiCall(
        "GET",
        `${apiUrl.GET_PRODUCT_FEATURE_LIST}/${catagoryId}?userId=${userId}&productId=${productId}`,
        "",
        onSuccess,
        onFailure
      );
    } catch (error) {
      dispatch(setProductLoading(false));
    }
  };

export const getFilterProductApi =
  (
    categoryId,
    brandname,
    colorsData,
    fabric,
    rateWiseData,
    occasionData,
    shippingData,
    userid,
    sortData,
    currentPage
  ) =>
  (dispatch) => {
    dispatch(setProductLoading(true));
    try {
      const onSuccess = (response) => {
        dispatch(getFilterProductData(response?.products));
        dispatch(getFilterProductData2(response));
        dispatch(setProductLoading(false));
      };
      const onFailure = (error) => {
        dispatch(setProductLoading(false));
      };
      apiCall(
        "GET",
        `${apiUrl.GET_FILTER_PRODUCT}?categoryId=${categoryId}&brands=${brandname}&color=${colorsData}&fabric=${fabric}&rate=${rateWiseData}&occasion=${occasionData}&shipping=${shippingData}&userId=${userid}&sortBy=${sortData}&page=${currentPage}`,
        "",
        onSuccess,
        onFailure
      );
    } catch (error) {
      dispatch(setProductLoading(false));
    }
  };

export const getFilterListApi = () => (dispatch) => {
  dispatch(setProductLoading(true));
  try {
    const onSuccess = (response) => {
      dispatch(getFilterListData(response?.data));
      dispatch(setProductLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setProductLoading(false));
    };
    apiCall(
      "GET",
      `${apiUrl.GET_FILTERLIST_PRODUCT}`,
      "",
      onSuccess,
      onFailure
    );
  } catch (error) {
    dispatch(setProductLoading(false));
  }
};

export const getSearchProductApi =
  (query, userId, onSuccessCallback) => (dispatch) => {
    dispatch(setProductLoading(true));
    try {
      const onSuccess = (response) => {
        dispatch(getFilterListData(response?.products));
        dispatch(setProductLoading(false));
        onSuccessCallback(response);
      };
      const onFailure = (error) => {
        dispatch(setProductLoading(false));
      };
      apiCall(
        "GET",
        `${
          apiUrl.GET_SEARCH_PRODUCT
        }?query=${query}&userId=${userId}&limit=${100}`,
        "",
        onSuccess,
        onFailure
      );
    } catch (error) {
      dispatch(setProductLoading(false));
    }
  };
