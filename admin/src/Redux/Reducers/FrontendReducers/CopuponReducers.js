const initialState = {
  payload: [],
};

const CouponDataChange = (state = initialState, action) => {
  switch (action.type) {
    case "EDIT_COUPON":
      const { data } = action.payload;
      return {
        payload: data,
      };

    default:
      return state;
  }
};

export default CouponDataChange;
