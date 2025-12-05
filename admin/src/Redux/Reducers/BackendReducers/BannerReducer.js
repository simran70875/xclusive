const initialState = {
    payload: []
}


const BannerDataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_BANNER":
            const { data } = action.payload
            return {
                payload: data
            }

        default:
            return state
    }
}

export default  BannerDataChange 