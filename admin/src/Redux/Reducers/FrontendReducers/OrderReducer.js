const initialState = {
    payload: []
}


const OrderDataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_ORDER":
            const { data } = action.payload
            return {
                payload: data
            }

        default:
            return state
    }
}

export default OrderDataChange