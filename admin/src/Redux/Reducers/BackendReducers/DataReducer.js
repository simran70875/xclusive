const initialState = {
    payload: []
}


const DataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_DATA":
            const { data } = action.payload
            return {
                payload: data
            }

        default:
            return state
    }
}

export default DataChange