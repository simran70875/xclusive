const initialState = {
    payload: []
}


const CategoryDataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_CATEGORY":
            const { data } = action.payload
            return {
                payload: data
            }

        default:
            return state
    }
}

export default CategoryDataChange