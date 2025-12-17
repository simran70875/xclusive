import { createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "../../Constant";
import { apiCall } from "../../Services/CommonService";

const initialState = {
  SpecificationData: null,
  SpecificationLoading: false,
};

export const specification = createSlice({
  name: "specification",
  initialState,
  reducers: {
    getSpecificationData: (state, action) => {
      state.SpecificationData = action.payload;
    },
    setSpecificationLoading: (state, action) => {
      state.SpecificationLoading = action.payload;
    },
  },
});

export const { getSpecificationData, setSpecificationLoading } = specification.actions;

export default specification.reducer;

export const getSpecificationApi = () => (dispatch) => {
  dispatch(setSpecificationLoading(true));
  try {
    const onSuccess = (response) => {
      console.log(response?.data)
      dispatch(getSpecificationData(response?.data));
      dispatch(setSpecificationLoading(false));
    };
    const onFailure = (error) => {
      dispatch(setSpecificationLoading(false));
    };

    apiCall("GET", `${apiUrl.GET_SPECIFICATION}`, "", onSuccess, onFailure);
  } catch (error) {
    dispatch(setSpecificationLoading(false));
  }
};

