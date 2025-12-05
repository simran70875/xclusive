const initialState = {
    payload: []
}


const ProductDataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_PRODUCT":
            const { data } = action.payload
            return {
                payload: data
            }

        default:
            return state
    }
}

export default ProductDataChange