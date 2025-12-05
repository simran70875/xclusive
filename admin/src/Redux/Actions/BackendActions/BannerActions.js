export const editBanner = (bannerId) => {
  return {
    type: "EDIT_BANNER",
    payload: {
      data: bannerId,
    },
  };
};

export const editProductBanner = (bannerId) => {
  return {
    type: "EDIT_PRODUCT_BANNER",
    payload: {
      data: bannerId,
    },
  };
};



export const editPopUpBanner = (bannerId) => {
    return {
      type: "EDIT_POPUP_BANNER",
      payload: {
        data: bannerId,
      },
    };
  };
  