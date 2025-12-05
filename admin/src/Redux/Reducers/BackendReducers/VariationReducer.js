const initialState = {
    payload: []
}


const VariationDataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_VARIATION":
            const { data } = action.payload
            return {
                payload: data
            }

        case "SHOW_VARIATION":
            const { datas } = action.payload
            return {
                payload: datas
            }


        default:
            return state
    }
}

const VariationSizeDataChange = (state = initialState, action) => {
    switch (action.type) {

        case "SHOW_VARIATION_SIZE":
            const { sizedata } = action.payload
            return {
                payload: sizedata
            }


        default:
            return state
    }
}



export { VariationDataChange, VariationSizeDataChange }