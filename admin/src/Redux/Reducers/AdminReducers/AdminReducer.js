const initialState = {
    payload: []
}


const AdminDataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_SUB_ADMIN":
            const { data } = action.payload
            return {
                payload: data
            }

        default:
            return state
    }
}

export default AdminDataChange 