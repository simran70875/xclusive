const initialState = {
    payload: []
}


const ProductBannerDataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_PRODUCT_BANNER":
            const { data } = action.payload
            return {
                payload: data
            }

        default:
            return state
    }
}


export default ProductBannerDataChange 